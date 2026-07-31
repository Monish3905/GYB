export class WalletRiskEvaluator {
  public evaluate(riskScore: number, mixerExposure: number): number {
    return Math.min(riskScore + (mixerExposure * 2), 100);
  }
}
