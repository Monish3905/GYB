export interface IFraudModel {
  predict(features: Record<string, any>): Promise<number>; // 0.0 to 1.0
}

export interface IAnomalyDetector {
  detect(features: Record<string, any>): Promise<{ isAnomaly: boolean; score: number }>;
}

export interface IEmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export interface ILLMProvider {
  chat(prompt: string, context?: string): Promise<string>;
}

export interface IRecommendationProvider {
  recommend(paymentContext: Record<string, any>): Promise<'APPROVE' | 'REJECT' | 'MANUAL_REVIEW' | 'REQUEST_DOCUMENTS' | 'ENHANCED_DUE_DILIGENCE' | 'FREEZE_WALLET' | 'ESCALATE'>;
}

export interface IGraphProvider {
  query(cypher: string, parameters?: Record<string, any>): Promise<any>;
}
