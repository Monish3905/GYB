import { IFraudModel } from '@payment-os/ai-core';
import { FeatureStoreManager } from '@payment-os/feature-store';
import { ExplainabilityEngine, Explanation } from '@payment-os/explainability';
import { RecommendationEngine } from '@payment-os/recommendation-engine';
import { IEventBus } from '@payment-os/event-bus';

export interface AiDecisionResult {
  adaptiveRiskScore: number;
  fraudProbability: number;
  explanation: Explanation;
  recommendation: string;
}

export class AiDecisionService {
  constructor(
    private bus: IEventBus,
    private featureStore: FeatureStoreManager,
    private fraudModel: IFraudModel,
    private explainability: ExplainabilityEngine,
    private recommendationEngine: RecommendationEngine
  ) {}

  public async evaluateAiContext(
    paymentId: string,
    customerId: string,
    ruleRiskScore: number,
    correlationId: string
  ): Promise<AiDecisionResult> {
    
    // 1. Fetch Features
    const features = await this.featureStore.getTransactionFeatures(customerId);

    // 2. Predict Fraud Probability
    const fraudProbability = await this.fraudModel.predict(features);

    // 3. Adaptive Risk Calculation
    // Adaptive Risk = Rule Score × 0.70 + ML Score (fraudProb * 100) × 0.30
    const mlScore = fraudProbability * 100;
    const adaptiveRiskScore = Math.round((ruleRiskScore * 0.70) + (mlScore * 0.30));

    // 4. Explainability
    const explanation = this.explainability.generateExplanation(fraudProbability, features);

    // 5. Recommendations
    const recommendation = await this.recommendationEngine.recommend({
      finalRiskScore: adaptiveRiskScore,
      fraudProbability
    });

    // Fire AI Events
    await this.bus.publish('payment.domain.ai.fraudpredicted', {
      eventId: crypto.randomUUID(),
      correlationId,
      traceId: crypto.randomUUID(),
      aggregateId: paymentId,
      aggregateType: 'Payment',
      eventType: 'FraudPredicted',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'AiDecisionService',
      payload: {
        paymentId,
        fraudProbability,
        topFeatures: explanation.topFeatures,
        confidence: explanation.confidence,
        explanation: explanation.reasoning
      },
      headers: {}
    });

    let adaptiveRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (adaptiveRiskScore >= 90) adaptiveRiskLevel = 'CRITICAL';
    else if (adaptiveRiskScore >= 70) adaptiveRiskLevel = 'HIGH';
    else if (adaptiveRiskScore >= 40) adaptiveRiskLevel = 'MEDIUM';

    await this.bus.publish('payment.domain.ai.adaptiveriskcalculated', {
      eventId: crypto.randomUUID(),
      correlationId,
      traceId: crypto.randomUUID(),
      aggregateId: paymentId,
      aggregateType: 'Payment',
      eventType: 'AdaptiveRiskCalculated',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'AiDecisionService',
      payload: {
        paymentId,
        finalRiskScore: adaptiveRiskScore,
        ruleScore: ruleRiskScore,
        mlScore,
        adaptiveRiskLevel,
        explanation: explanation.reasoning
      },
      headers: {}
    });

    await this.bus.publish('payment.domain.ai.recommendationgenerated', {
      eventId: crypto.randomUUID(),
      correlationId,
      traceId: crypto.randomUUID(),
      aggregateId: paymentId,
      aggregateType: 'Payment',
      eventType: 'RecommendationGenerated',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'AiDecisionService',
      payload: {
        paymentId,
        recommendation,
        confidence: explanation.confidence,
        reasoning: explanation.reasoning
      },
      headers: {}
    });

    return {
      adaptiveRiskScore,
      fraudProbability,
      explanation,
      recommendation
    };
  }
}
