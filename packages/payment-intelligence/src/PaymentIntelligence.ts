export interface HistoricalDecision {
  transactionId: string;
  selectedRoute: string;
  estimatedCostUSD: number;
  actualCostUSD: number;
  estimatedLatencyMs: number;
  actualLatencyMs: number;
  success: boolean;
  timestamp: Date;
}

export class PaymentIntelligenceEngine {
  private history: HistoricalDecision[] = [];

  recordDecision(decision: HistoricalDecision): void {
    this.history.push(decision);
  }

  getHistoricalAverages(route: string): { avgCostDev: number; avgLatencyDev: number; successRate: number } | null {
    const records = this.history.filter(h => h.selectedRoute === route);
    if (records.length === 0) return null;

    const successes = records.filter(r => r.success).length;
    const avgCostDev = records.reduce((sum, r) => sum + (r.actualCostUSD - r.estimatedCostUSD), 0) / records.length;
    const avgLatencyDev = records.reduce((sum, r) => sum + (r.actualLatencyMs - r.estimatedLatencyMs), 0) / records.length;

    return {
      avgCostDev,
      avgLatencyDev,
      successRate: successes / records.length
    };
  }
}
