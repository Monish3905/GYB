import { DomainEvent } from './IEventBus';

export interface LiquidityReservedEvent extends DomainEvent {
  eventType: 'LiquidityReserved';
  reservationId: string;
  transactionId: string;
  poolId: string;
  currency: string;
  amount: number;
}

export interface LiquidityCommittedEvent extends DomainEvent {
  eventType: 'LiquidityCommitted';
  reservationId: string;
  transactionId: string;
}

export interface LiquidityRolledBackEvent extends DomainEvent {
  eventType: 'LiquidityRolledBack';
  reservationId: string;
  transactionId: string;
  reason: string;
}

export interface TreasuryRebalancedEvent extends DomainEvent {
  eventType: 'TreasuryRebalanced';
  sourcePoolId: string;
  targetPoolId: string;
  currency: string;
  amount: number;
  reason: string;
}

export interface ReserveThresholdExceededEvent extends DomainEvent {
  eventType: 'ReserveThresholdExceeded';
  poolId: string;
  currentReserveRatio: number;
  minimumReserveRatio: number;
}
