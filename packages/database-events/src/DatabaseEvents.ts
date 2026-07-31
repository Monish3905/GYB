import { DomainEvent } from '@payment-os/events';

export interface TransactionStarted extends DomainEvent {
  eventType: 'TransactionStarted';
  transactionId: string;
}

export interface TransactionCommitted extends DomainEvent {
  eventType: 'TransactionCommitted';
  transactionId: string;
}

export interface TransactionRolledBack extends DomainEvent {
  eventType: 'TransactionRolledBack';
  transactionId: string;
  reason: string;
}

export interface OutboxWritten extends DomainEvent {
  eventType: 'OutboxWritten';
  outboxEventId: string;
}

export interface DatabaseHealthy extends DomainEvent {
  eventType: 'DatabaseHealthy';
  latencyMs: number;
}

export interface DatabaseUnhealthy extends DomainEvent {
  eventType: 'DatabaseUnhealthy';
  error: string;
}
