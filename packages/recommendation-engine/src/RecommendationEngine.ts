import { IRecommendationProvider } from '@payment-os/ai-core';

export class RecommendationEngine implements IRecommendationProvider {
  public async recommend(paymentContext: Record<string, any>): Promise<'APPROVE' | 'REJECT' | 'MANUAL_REVIEW' | 'REQUEST_DOCUMENTS' | 'ENHANCED_DUE_DILIGENCE' | 'FREEZE_WALLET' | 'ESCALATE'> {
    const finalRiskScore = paymentContext['finalRiskScore'] ?? 0;
    const fraudProb = paymentContext['fraudProbability'] ?? 0;

    if (fraudProb > 0.90 || finalRiskScore >= 95) {
      return 'FREEZE_WALLET';
    }
    if (fraudProb > 0.70 || finalRiskScore >= 80) {
      return 'REJECT';
    }
    if (finalRiskScore >= 70) {
      return 'ENHANCED_DUE_DILIGENCE';
    }
    if (finalRiskScore >= 50) {
      return 'REQUEST_DOCUMENTS';
    }
    if (finalRiskScore >= 40) {
      return 'MANUAL_REVIEW';
    }
    return 'APPROVE';
  }
}
