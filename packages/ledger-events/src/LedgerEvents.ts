import { DomainEvent } from '@payment-os/events';

export interface JournalCreated extends DomainEvent {
  eventType: 'JournalCreated';
  journalId: string;
}

export interface JournalValidated extends DomainEvent {
  eventType: 'JournalValidated';
  journalId: string;
}

export interface JournalRejected extends DomainEvent {
  eventType: 'JournalRejected';
  journalId: string;
  reason: string;
}

export interface JournalPosted extends DomainEvent {
  eventType: 'JournalPosted';
  journalId: string;
  ledgerSequence: number;
}

export interface JournalReversed extends DomainEvent {
  eventType: 'JournalReversed';
  originalJournalId: string;
  reversalJournalId: string;
}

export interface BalanceProjected extends DomainEvent {
  eventType: 'BalanceProjected';
  accountId: string;
  newBalance: number;
  currency: string;
}

export interface ReconciliationStarted extends DomainEvent {
  eventType: 'ReconciliationStarted';
  reconciliationId: string;
}

export interface ReconciliationCompleted extends DomainEvent {
  eventType: 'ReconciliationCompleted';
  reconciliationId: string;
  matchedCount: number;
  exceptionCount: number;
}

export interface TrialBalanceGenerated extends DomainEvent {
  eventType: 'TrialBalanceGenerated';
  periodStart: Date;
  periodEnd: Date;
}

export interface FinancialReportGenerated extends DomainEvent {
  eventType: 'FinancialReportGenerated';
  reportType: string;
}

export interface PeriodClosed extends DomainEvent {
  eventType: 'PeriodClosed';
  periodId: string;
}

export interface AuditRecordCreated extends DomainEvent {
  eventType: 'AuditRecordCreated';
  auditId: string;
}
