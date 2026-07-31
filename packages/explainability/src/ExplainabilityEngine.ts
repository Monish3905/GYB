export interface Explanation {
  topFeatures: string[];
  confidence: number;
  reasoning: string;
}

export class ExplainabilityEngine {
  public generateExplanation(fraudProb: number, features: Record<string, any>): Explanation {
    const topFeatures: string[] = [];
    const reasons: string[] = [];

    if (features['30_day_volume'] > 50000) {
      topFeatures.push('30_day_volume');
      reasons.push('Unusually large 30-day transfer volume');
    }
    if (features['velocity'] > 10) {
      topFeatures.push('velocity');
      reasons.push('High transfer velocity');
    }
    if (features['country_diversity'] > 3) {
      topFeatures.push('country_diversity');
      reasons.push('Transfers to many different countries');
    }

    const reasoning = reasons.length > 0
      ? `Risk increased because: ${reasons.join(', ')}.`
      : `Normal transaction pattern.`;

    // Confidence derived from how strongly the probability points to one class (0 or 1)
    const confidence = Math.abs(fraudProb - 0.5) * 2 * 100;

    return {
      topFeatures,
      confidence: Math.round(confidence),
      reasoning
    };
  }
}
