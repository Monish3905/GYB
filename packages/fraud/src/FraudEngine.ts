export interface FraudResult {
  riskScore: number;
  confidence: number;
  evidence: string[];
  decision: 'APPROVE' | 'REVIEW' | 'REJECT';
}

export class FraudEngine {
  public async evaluate(deviceIp: string, amount: number, country: string): Promise<FraudResult> {
    const evidence: string[] = [];
    let riskScore = 0;

    // Impossible travel / Geo-mismatch mock
    if (country === 'HIGH_RISK_COUNTRY') {
      riskScore += 60;
      evidence.push('High risk origin country.');
    }

    if (amount > 50000) {
      riskScore += 30;
      evidence.push('Unusually large transaction amount.');
    }

    let decision: 'APPROVE' | 'REVIEW' | 'REJECT' = 'APPROVE';
    if (riskScore > 80) decision = 'REJECT';
    else if (riskScore > 50) decision = 'REVIEW';

    return {
      riskScore,
      confidence: 90,
      evidence,
      decision
    };
  }
}
