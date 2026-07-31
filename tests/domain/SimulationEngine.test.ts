import { CostEngine } from '../../src/domains/routing/services/CostEngine';
import { SimulationEngine } from '../../src/domains/routing/services/SimulationEngine';
import { Decimal } from '../../src/shared/types';

describe('SimulationEngine', () => {
  let costEngine: CostEngine;
  let simulationEngine: SimulationEngine;

  beforeEach(() => {
    costEngine = new CostEngine();
    simulationEngine = new SimulationEngine(costEngine);
  });

  it('should evaluate all routes and rank them correctly', async () => {
    const results = await simulationEngine.simulateAllRoutes({
      fromCurrency: 'USD',
      toCurrency: 'USDC',
      amount: new Decimal(1000),
      senderCountry: 'US',
      recipientCountry: 'UK'
    });

    expect(results.length).toBe(3); // Internal, Solana, SWIFT

    // Solana should be first (highest score) because 1000 USD via SWIFT is $25, but Solana is $0.10 + low FX
    expect(results[0].route.name).toBe('Solana_USDC');
    expect(results[1].route.name).toBe('Internal_Netting');
    expect(results[2].route.name).toBe('SWIFT_Wire');

    expect(results[0].score).toBeGreaterThan(results[2].score);
  });
});
