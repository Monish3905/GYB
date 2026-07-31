import { ProviderRegistry } from '@payment-os/registry';
import { CorridorIntelligenceEngine } from '@payment-os/corridors';
import { RouteGenerator, RouteCandidate } from '@payment-os/routing';
import { SimulationEngine } from '@payment-os/simulation';
import { LiquidityIntelligenceEngine } from '@payment-os/liquidity-intelligence';
import { TreasuryIntelligenceEngine } from '@payment-os/treasury-intelligence';
import { ProviderReputationEngine } from '@payment-os/provider-reputation';
import { RouteOptimizer } from '@payment-os/route-optimizer';
import { DecisionEngine } from '@payment-os/decision-engine';
import { IProvider, ProviderCapabilities, ProviderQuote } from '@payment-os/providers';

// --- MOCK PROVIDERS ---
class MockProvider implements IProvider {
  constructor(
    public id: string,
    public type: 'blockchain' | 'bank' | 'internal' | 'mobile_money',
    private caps: ProviderCapabilities,
    private quoteResult: ProviderQuote
  ) {}

  getCapabilities(): ProviderCapabilities { return this.caps; }
  async quote(fromAsset: string, toAsset: string, amount: number): Promise<ProviderQuote> {
    return this.quoteResult;
  }
}

describe('Smart Routing & Payment Intelligence Engine', () => {
  let registry: ProviderRegistry;
  let corridorEngine: CorridorIntelligenceEngine;
  let routeGenerator: RouteGenerator;
  let simulationEngine: SimulationEngine;
  let liquidityEngine: LiquidityIntelligenceEngine;
  let treasuryEngine: TreasuryIntelligenceEngine;
  let reputationEngine: ProviderReputationEngine;
  let optimizer: RouteOptimizer;
  let decisionEngine: DecisionEngine;

  beforeEach(() => {
    registry = new ProviderRegistry();
    
    // Register basic internal provider
    registry.register(new MockProvider('Internal_Netting', 'internal', {
      supportedCountries: ['US', 'IN', 'EU'],
      supportedAssets: ['USD', 'INR', 'EUR'],
      supportedStablecoins: ['USDC'],
      settlementSpeed: 'instant',
      liquidity: 'high',
      maxAmount: 1000000,
      minAmount: 1,
      supportsBatching: true,
      supportsStreaming: false,
      supportsBridging: true,
      supportsSwaps: true
    }, {
      settlementFeeUSD: 0,
      gasFeeUSD: 0,
      fxSpread: 2.0, // Internal FX markup
      bridgeFeeUSD: 0,
      liquidityCostUSD: 1.0,
      treasuryCostUSD: 0.5,
      estimatedTimeMs: 100, // Very fast
      successProbability: 0.999,
      complianceStatus: 'pass',
      riskScore: 1
    }));

    // Register Solana
    registry.register(new MockProvider('Solana_USDC', 'blockchain', {
      supportedCountries: ['US', 'IN', 'EU'],
      supportedAssets: ['USDC'],
      supportedStablecoins: ['USDC'],
      settlementSpeed: 'instant',
      liquidity: 'high',
      maxAmount: 5000000,
      minAmount: 0.1,
      supportsBatching: false,
      supportsStreaming: false,
      supportsBridging: false,
      supportsSwaps: false
    }, {
      settlementFeeUSD: 0,
      gasFeeUSD: 0.003, // Dirt cheap
      fxSpread: 0,
      bridgeFeeUSD: 0,
      liquidityCostUSD: 0,
      treasuryCostUSD: 0,
      estimatedTimeMs: 400, // 400ms finality
      successProbability: 0.995,
      complianceStatus: 'pass',
      riskScore: 5
    }));

    // Register Base
    registry.register(new MockProvider('Base_USDC', 'blockchain', {
      supportedCountries: ['US', 'IN'],
      supportedAssets: ['USDC'],
      supportedStablecoins: ['USDC'],
      settlementSpeed: 'instant',
      liquidity: 'high',
      maxAmount: 5000000,
      minAmount: 1,
      supportsBatching: false,
      supportsStreaming: false,
      supportsBridging: false,
      supportsSwaps: false
    }, {
      settlementFeeUSD: 0,
      gasFeeUSD: 0.05,
      fxSpread: 0,
      bridgeFeeUSD: 0,
      liquidityCostUSD: 0,
      treasuryCostUSD: 0,
      estimatedTimeMs: 2000,
      successProbability: 0.998,
      complianceStatus: 'pass',
      riskScore: 3
    }));
    
    // Register Circle CCTP
    registry.register(new MockProvider('Circle_CCTP', 'blockchain', {
      supportedCountries: ['US', 'IN'],
      supportedAssets: ['USDC'],
      supportedStablecoins: ['USDC'],
      settlementSpeed: 'minutes',
      liquidity: 'high',
      maxAmount: 10000000,
      minAmount: 100,
      supportsBatching: false,
      supportsStreaming: false,
      supportsBridging: true,
      supportsSwaps: false
    }, {
      settlementFeeUSD: 0,
      gasFeeUSD: 0,
      fxSpread: 0,
      bridgeFeeUSD: 0, // Free cross-chain
      liquidityCostUSD: 0,
      treasuryCostUSD: 0,
      estimatedTimeMs: 120000, // 2 mins
      successProbability: 0.999,
      complianceStatus: 'pass',
      riskScore: 2
    }));

    corridorEngine = new CorridorIntelligenceEngine();
    routeGenerator = new RouteGenerator(registry, corridorEngine);
    simulationEngine = new SimulationEngine(registry);
    liquidityEngine = new LiquidityIntelligenceEngine();
    treasuryEngine = new TreasuryIntelligenceEngine();
    reputationEngine = new ProviderReputationEngine();
    optimizer = new RouteOptimizer();
    
    decisionEngine = new DecisionEngine(
      optimizer, 
      liquidityEngine, 
      treasuryEngine, 
      reputationEngine
    );
  });

  it('generates multi-hop routes and evaluates them', async () => {
    // 1. Generate Routes
    const candidates = routeGenerator.generateRoutes('US', 'IN', 'USD', 'INR');
    expect(candidates.length).toBeGreaterThan(0);
    
    // 2. Simulate Routes
    const simulations = await Promise.all(
      candidates.map(c => simulationEngine.simulate(c, 10000))
    );

    // 3. Make Decision (Cheapest)
    const decisionCheapest = decisionEngine.makeDecision(simulations, 'cheapest', 'US', 'USD');
    expect(decisionCheapest.reasoning.explanation).toBeDefined();
    
    // 4. Make Decision (Fastest)
    const decisionFastest = decisionEngine.makeDecision(simulations, 'fastest', 'US', 'USD');
    expect(decisionFastest.reasoning.explanation).toBeDefined();

    // In our mocked setup, Internal is faster, but hybrid Solana is cheaper
    // We expect the Engine to explain this correctly.
  });

  it('falls back when a provider reputation drops', async () => {
    const candidates = routeGenerator.generateRoutes('US', 'IN', 'USD', 'INR');
    const simulations = await Promise.all(
      candidates.map(c => simulationEngine.simulate(c, 10000))
    );

    // Ruin Solana's reputation
    for (let i = 0; i < 10; i++) {
      reputationEngine.recordFailure('Solana_USDC');
    }
    
    // Make Decision again
    const decision = decisionEngine.makeDecision(simulations, 'cheapest', 'US', 'USD');
    
    // The selected route should no longer include Solana_USDC because it is unhealthy
    const hasSolana = decision.selectedRoute.candidate.hops.some(h => h.providerId === 'Solana_USDC');
    expect(hasSolana).toBe(false);
  });
});
