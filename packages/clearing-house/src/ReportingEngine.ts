export interface SettlementMetrics {
  grossVolume: number;
  netVolume: number;
  settlementVolume: number;
  compressionRatio: number;
  nettingRatio: number;
  liquiditySaved: number;
  gasSaved: number;
  treasurySaved: number;
  fxSaved: number;
  averageSettlementSize: number;
  settlementCountReduction: number;
  providerSavings: Record<string, number>;
  countrySavings: Record<string, number>;
  blockchainSavings: Record<string, number>;
  historicalTrends: Record<string, any>;
}

export class ReportingEngine {
  private metrics: SettlementMetrics;

  constructor() {
    this.metrics = {
      grossVolume: 0,
      netVolume: 0,
      settlementVolume: 0,
      compressionRatio: 0,
      nettingRatio: 0,
      liquiditySaved: 0,
      gasSaved: 0,
      treasurySaved: 0,
      fxSaved: 0,
      averageSettlementSize: 0,
      settlementCountReduction: 0,
      providerSavings: {},
      countrySavings: {},
      blockchainSavings: {},
      historicalTrends: {}
    };
  }

  public recordGrossVolume(amount: number) {
    this.metrics.grossVolume += amount;
  }

  public recordNetVolume(amount: number) {
    this.metrics.netVolume += amount;
    this.updateRatios();
  }

  public recordSettlementVolume(amount: number) {
    this.metrics.settlementVolume += amount;
  }

  public recordSavings(type: 'liquidity' | 'gas' | 'treasury' | 'fx', amount: number) {
    if (type === 'liquidity') this.metrics.liquiditySaved += amount;
    if (type === 'gas') this.metrics.gasSaved += amount;
    if (type === 'treasury') this.metrics.treasurySaved += amount;
    if (type === 'fx') this.metrics.fxSaved += amount;
  }

  public generateReport(): Readonly<SettlementMetrics> {
    return Object.freeze({ ...this.metrics });
  }

  private updateRatios() {
    if (this.metrics.grossVolume > 0) {
      this.metrics.nettingRatio = (this.metrics.grossVolume - this.metrics.netVolume) / this.metrics.grossVolume;
    }
  }
}
