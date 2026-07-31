import { IntegrationEvent } from '@payment-os/event-contracts';

export interface FraudPredictedEvent extends IntegrationEvent {
  eventType: 'FraudPredicted';
  payload: {
    paymentId: string;
    fraudProbability: number; // 0.00 to 1.00
    topFeatures: string[];
    confidence: number;
    explanation: string;
  };
}

export interface AdaptiveRiskCalculatedEvent extends IntegrationEvent {
  eventType: 'AdaptiveRiskCalculated';
  payload: {
    paymentId: string;
    finalRiskScore: number;
    ruleScore: number;
    mlScore: number;
    adaptiveRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    explanation: string;
  };
}

export interface BehaviorProfileUpdatedEvent extends IntegrationEvent {
  eventType: 'BehaviorProfileUpdated';
  payload: {
    customerId: string;
    newAverageTransfer: number;
    preferredCountries: string[];
    riskDrift: number;
    updatedAt: Date;
  };
}

export interface EntityMatchedEvent extends IntegrationEvent {
  eventType: 'EntityMatched';
  payload: {
    primaryIdentityId: string;
    matchedIdentityId: string;
    matchScore: number;
    matchReasons: string[];
  };
}

export interface GraphRiskCalculatedEvent extends IntegrationEvent {
  eventType: 'GraphRiskCalculated';
  payload: {
    paymentId: string;
    graphRiskScore: number;
    connectedFlags: string[];
  };
}

export interface RecommendationGeneratedEvent extends IntegrationEvent {
  eventType: 'RecommendationGenerated';
  payload: {
    paymentId: string;
    recommendation: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW' | 'REQUEST_DOCUMENTS' | 'ENHANCED_DUE_DILIGENCE' | 'FREEZE_WALLET' | 'ESCALATE';
    confidence: number;
    reasoning: string;
  };
}

export interface CaseSummarizedEvent extends IntegrationEvent {
  eventType: 'CaseSummarized';
  payload: {
    caseId: string;
    summary: string;
    keyRiskFactors: string[];
    generatedAt: Date;
  };
}

export interface CopilotQuestionAskedEvent extends IntegrationEvent {
  eventType: 'CopilotQuestionAsked';
  payload: {
    copilotSessionId: string;
    analystId: string;
    question: string;
    response: string;
    timestamp: Date;
  };
}
