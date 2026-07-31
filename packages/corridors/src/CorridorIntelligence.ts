export interface CorridorConfig {
  fromCountry: string;
  toCountry: string;
  fromCurrency: string;
  toCurrency: string;
  
  preferredPaths: string[];         // e.g., ["Internal_Rail", "Solana_USDC_CCTP"]
  fallbackPaths: string[];          // e.g., ["Base_USDC", "SWIFT"]
  
  historicalSuccessRate: number;    // e.g., 0.995 (99.5%)
  historicalAvgCostUSD: number;
  historicalAvgLatencyMs: number;
  
  regulatoryRestrictions: string[]; // e.g., ["Requires_KYC_Level_2"]
  seasonalDemand: 'high' | 'medium' | 'low';
}

export class CorridorIntelligenceEngine {
  private corridors: Map<string, CorridorConfig> = new Map();

  /**
   * Initializes some hardcoded intelligence for demonstration purposes.
   * In production, this would be loaded from a database and updated continuously by PaymentIntelligence.
   */
  constructor() {
    this.corridors.set('US-IN-USD-INR', {
      fromCountry: 'US',
      toCountry: 'IN',
      fromCurrency: 'USD',
      toCurrency: 'INR',
      preferredPaths: ['Internal_Netting', 'Solana_USDC'],
      fallbackPaths: ['Polygon_USDC', 'ACH_Wire'],
      historicalSuccessRate: 0.998,
      historicalAvgCostUSD: 0.15,
      historicalAvgLatencyMs: 14000,
      regulatoryRestrictions: ['FEMA_Reporting'],
      seasonalDemand: 'high'
    });
    
    this.corridors.set('EU-US-EUR-USD', {
      fromCountry: 'EU',
      toCountry: 'US',
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      preferredPaths: ['SEPA_to_ACH', 'Base_USDC'],
      fallbackPaths: ['SWIFT'],
      historicalSuccessRate: 0.985,
      historicalAvgCostUSD: 1.50,
      historicalAvgLatencyMs: 86400000, // 1 day
      regulatoryRestrictions: ['AML_Directive_6'],
      seasonalDemand: 'medium'
    });
  }

  /**
   * Gets intelligence for a specific corridor
   */
  getCorridorInfo(fromCountry: string, toCountry: string, fromCurrency: string, toCurrency: string): CorridorConfig | null {
    const key = `${fromCountry}-${toCountry}-${fromCurrency}-${toCurrency}`;
    return this.corridors.get(key) || null;
  }
}
