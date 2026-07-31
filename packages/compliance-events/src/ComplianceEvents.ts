import { IntegrationEvent } from '@payment-os/event-contracts';

export interface ComplianceApprovedEvent extends IntegrationEvent {
  eventType: 'ComplianceApproved';
  payload: {
    paymentId: string;
    decisionId: string;
    riskScore: number;
    approvedAt: Date;
  };
}

export interface ComplianceRejectedEvent extends IntegrationEvent {
  eventType: 'ComplianceRejected';
  payload: {
    paymentId: string;
    decisionId: string;
    riskScore: number;
    reason: string;
    rejectedAt: Date;
  };
}

export interface ComplianceManualReviewEvent extends IntegrationEvent {
  eventType: 'ComplianceManualReview';
  payload: {
    paymentId: string;
    decisionId: string;
    caseId: string;
    reason: string;
    requiredAt: Date;
  };
}
