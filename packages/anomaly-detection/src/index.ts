import { IAnomalyDetector } from '@payment-os/ai-core';
export class AnomalyDetectionEngine implements IAnomalyDetector {
  public async detect(features: Record<string, any>): Promise<{ isAnomaly: boolean; score: number }> {
    return { isAnomaly: false, score: 0.1 };
  }
}
