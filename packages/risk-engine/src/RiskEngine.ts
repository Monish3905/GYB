export interface RiskEvaluation {
  compositeScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  decision: 'APPROVE' | 'MANUAL_REVIEW' | 'REJECT';
}

export class RiskEngine {
  public async calculateRisk(
    customerRisk: number,
    walletRisk: number,
    providerRisk: number,
    corridorRisk: number,
    fraudScore: number,
    amlScore: number
  ): Promise<RiskEvaluation> {
    
    // Composite scoring logic
    const compositeScore = Math.round(
      (customerRisk * 0.2) +
      (walletRisk * 0.2) +
      (providerRisk * 0.1) +
      (corridorRisk * 0.1) +
      (fraudScore * 0.2) +
      (amlScore * 0.2)
    );

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let decision: 'APPROVE' | 'MANUAL_REVIEW' | 'REJECT' = 'APPROVE';

    if (compositeScore >= 90) {
      riskLevel = 'CRITICAL';
      decision = 'REJECT';
    } else if (compositeScore >= 70) {
      riskLevel = 'HIGH';
      decision = 'MANUAL_REVIEW';
    } else if (compositeScore >= 40) {
      riskLevel = 'MEDIUM';
    }

    return { compositeScore, riskLevel, decision };
  }
}
