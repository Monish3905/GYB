import { IProvider } from '@payment-os/providers';
import { ProviderRegistry } from '@payment-os/registry';
import { CorridorIntelligenceEngine } from '@payment-os/corridors';

export interface RouteHop {
  providerId: string;
  fromAsset: string;
  toAsset: string;
  providerType: string;
}

export interface RouteCandidate {
  id: string;
  hops: RouteHop[];
  estimatedTotalTimeMs?: number;
}

export class RouteGenerator {
  constructor(
    private registry: ProviderRegistry,
    private corridorEngine: CorridorIntelligenceEngine
  ) {}

  /**
   * Generates all possible routes (single-hop and multi-hop) for a given pair.
   * Multi-hop logic: 
   * A traditional bank transfer might look like: USD_Bank -> Internal Rail -> USDC_Solana -> CCTP -> USDC_Base -> EUR_Bank
   * For deterministic demonstration, we'll build common hybrid routes plus direct routes.
   */
  generateRoutes(
    fromCountry: string, 
    toCountry: string, 
    fromCurrency: string, 
    toCurrency: string
  ): RouteCandidate[] {
    const candidates: RouteCandidate[] = [];
    let routeIdCounter = 1;

    const addCandidate = (hops: RouteHop[]) => {
      candidates.push({
        id: `route_${routeIdCounter++}`,
        hops
      });
    };

    // 1. Check Corridor Intelligence for Preferred/Fallback paths
    const corridorInfo = this.corridorEngine.getCorridorInfo(fromCountry, toCountry, fromCurrency, toCurrency);
    
    // Providers
    const allProviders = this.registry.getAllProviders();

    // Strategy 1: Direct Single-Hop Routes (if a provider supports both assets directly)
    const directProviders = allProviders.filter(p => {
      const caps = p.getCapabilities();
      return caps.supportedCountries.includes(fromCountry) && 
             caps.supportedCountries.includes(toCountry);
    });

    for (const dp of directProviders) {
      addCandidate([
        {
          providerId: dp.id,
          fromAsset: fromCurrency,
          toAsset: toCurrency,
          providerType: dp.type
        }
      ]);
    }

    // Strategy 2: Two-Hop Hybrid (e.g. Bank -> Blockchain)
    // Assume we have an internal Treasury that acts as the bridge.
    const fiatToCrypto = allProviders.find(p => p.type === 'internal');
    const cryptoProviders = allProviders.filter(p => p.type === 'blockchain');
    const cryptoToFiat = allProviders.find(p => p.type === 'internal' || p.type === 'bank');

    if (fiatToCrypto && cryptoToFiat) {
      for (const cp of cryptoProviders) {
        // e.g. Internal (USD -> USDC) -> Solana (USDC -> USDC) -> Internal (USDC -> INR)
        addCandidate([
          {
            providerId: fiatToCrypto.id,
            fromAsset: fromCurrency,
            toAsset: 'USDC',
            providerType: fiatToCrypto.type
          },
          {
            providerId: cp.id,
            fromAsset: 'USDC',
            toAsset: 'USDC',
            providerType: cp.type
          },
          {
            providerId: cryptoToFiat.id,
            fromAsset: 'USDC',
            toAsset: toCurrency,
            providerType: cryptoToFiat.type
          }
        ]);
      }
    }

    // Strategy 3: Multi-Hop with CCTP bridging
    // USD -> USDC(Base) -> CCTP -> USDC(Solana) -> INR
    const baseProvider = allProviders.find(p => p.id === 'Base_USDC');
    const solanaProvider = allProviders.find(p => p.id === 'Solana_USDC');
    const cctpProvider = allProviders.find(p => p.id === 'Circle_CCTP');

    if (fiatToCrypto && cryptoToFiat && baseProvider && solanaProvider && cctpProvider) {
      addCandidate([
        { providerId: fiatToCrypto.id, fromAsset: fromCurrency, toAsset: 'USDC', providerType: fiatToCrypto.type },
        { providerId: baseProvider.id, fromAsset: 'USDC', toAsset: 'USDC', providerType: baseProvider.type },
        { providerId: cctpProvider.id, fromAsset: 'USDC', toAsset: 'USDC', providerType: cctpProvider.type },
        { providerId: solanaProvider.id, fromAsset: 'USDC', toAsset: 'USDC', providerType: solanaProvider.type },
        { providerId: cryptoToFiat.id, fromAsset: 'USDC', toAsset: toCurrency, providerType: cryptoToFiat.type }
      ]);
    }

    return candidates;
  }
}
