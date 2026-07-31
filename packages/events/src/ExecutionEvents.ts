import { DomainEvent } from './IEventBus';

export interface ExecutionQueued extends DomainEvent {
  eventType: 'ExecutionQueued';
  executionId: string;
}

export interface ExecutionStarted extends DomainEvent {
  eventType: 'ExecutionStarted';
  executionId: string;
}

export interface ExecutionPlanCreated extends DomainEvent {
  eventType: 'ExecutionPlanCreated';
  executionId: string;
  planId: string;
}

export interface ExecutionNodeStarted extends DomainEvent {
  eventType: 'ExecutionNodeStarted';
  executionId: string;
  nodeId: string;
}

export interface ExecutionNodeCompleted extends DomainEvent {
  eventType: 'ExecutionNodeCompleted';
  executionId: string;
  nodeId: string;
}

export interface ExecutionPaused extends DomainEvent {
  eventType: 'ExecutionPaused';
  executionId: string;
  reason: string;
}

export interface ExecutionResumed extends DomainEvent {
  eventType: 'ExecutionResumed';
  executionId: string;
}

export interface ExecutionTimeout extends DomainEvent {
  eventType: 'ExecutionTimeout';
  executionId: string;
}

export interface ExecutionRetryStarted extends DomainEvent {
  eventType: 'ExecutionRetryStarted';
  executionId: string;
  attempt: number;
}

export interface ExecutionRetryCompleted extends DomainEvent {
  eventType: 'ExecutionRetryCompleted';
  executionId: string;
}

export interface ExecutionFailed extends DomainEvent {
  eventType: 'ExecutionFailed';
  executionId: string;
  reason: string;
}

export interface ExecutionRecovered extends DomainEvent {
  eventType: 'ExecutionRecovered';
  executionId: string;
}

export interface ExecutionRolledBack extends DomainEvent {
  eventType: 'ExecutionRolledBack';
  executionId: string;
}

export interface ExecutionCompleted extends DomainEvent {
  eventType: 'ExecutionCompleted';
  executionId: string;
}

export interface SettlementFinalized extends DomainEvent {
  eventType: 'SettlementFinalized';
  settlementId: string;
}

export interface TreasuryCommitted extends DomainEvent {
  eventType: 'TreasuryCommitted';
  executionId: string;
}

export interface LedgerCommitRequested extends DomainEvent {
  eventType: 'LedgerCommitRequested';
  executionId: string;
}

export interface LedgerCommitCompleted extends DomainEvent {
  eventType: 'LedgerCommitCompleted';
  executionId: string;
}

export interface ProviderCircuitOpened extends DomainEvent {
  eventType: 'ProviderCircuitOpened';
  providerId: string;
}

export interface ProviderCircuitClosed extends DomainEvent {
  eventType: 'ProviderCircuitClosed';
  providerId: string;
}

export interface ReservationExpired extends DomainEvent {
  eventType: 'ReservationExpired';
  reservationId: string;
}

export interface DeadLetterCreated extends DomainEvent {
  eventType: 'DeadLetterCreated';
  executionId: string;
}

export interface AuditRecordGenerated extends DomainEvent {
  eventType: 'AuditRecordGenerated';
  recordId: string;
}
