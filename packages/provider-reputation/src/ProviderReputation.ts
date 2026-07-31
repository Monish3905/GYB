export interface ProviderReputation {
  providerId: string;
  availabilityScore: number;     // 0-100
  historicalSuccessRate: number; // 0-1 (e.g. 0.999)
  averageLatencyMs: number;
  averageCostDeviation: number;  // How much final cost deviates from quote
  recentFailures: number;        // Within last 24h
  isCurrentlyHealthy: boolean;
}

export class ProviderReputationEngine {
  private reputations: Map<string, ProviderReputation> = new Map();

  constructor() {
    // Seed some mock data
    this.reputations.set('InternalRail', {
      providerId: 'InternalRail',
      availabilityScore: 100,
      historicalSuccessRate: 1.0,
      averageLatencyMs: 50,
      averageCostDeviation: 0,
      recentFailures: 0,
      isCurrentlyHealthy: true
    });
    
    this.reputations.set('Solana_USDC', {
      providerId: 'Solana_USDC',
      availabilityScore: 98,
      historicalSuccessRate: 0.995,
      averageLatencyMs: 13000,
      averageCostDeviation: 0.001, // Slippage
      recentFailures: 2,           // Minor RPC drops
      isCurrentlyHealthy: true
    });

    this.reputations.set('SWIFT_Wire', {
      providerId: 'SWIFT_Wire',
      availabilityScore: 95,
      historicalSuccessRate: 0.950,
      averageLatencyMs: 259200000, // 3 days
      averageCostDeviation: 2.0,   // Hidden correspondent bank fees
      recentFailures: 0,
      isCurrentlyHealthy: true
    });
  }

  getReputation(providerId: string): ProviderReputation {
    return this.reputations.get(providerId) || {
      providerId,
      availabilityScore: 50, // Unknown provider starts neutral
      historicalSuccessRate: 0.8,
      averageLatencyMs: 60000,
      averageCostDeviation: 0,
      recentFailures: 0,
      isCurrentlyHealthy: true
    };
  }

  recordFailure(providerId: string): void {
    const rep = this.getReputation(providerId);
    rep.recentFailures += 1;
    rep.historicalSuccessRate = Math.max(0, rep.historicalSuccessRate - 0.05);
    rep.availabilityScore = Math.max(0, rep.availabilityScore - 10);
    if (rep.availabilityScore < 50) {
      rep.isCurrentlyHealthy = false;
    }
    this.reputations.set(providerId, rep);
  }
}
