import { DomainEvent } from './IEventBus';

export interface ObligationCreated extends DomainEvent {
  eventType: 'ObligationCreated';
  obligationId: string;
  sourceCurrency: string;
  destinationCurrency: string;
  amount: number;
}

export interface ObligationValidated extends DomainEvent {
  eventType: 'ObligationValidated';
  obligationId: string;
}

export interface ExposureUpdated extends DomainEvent {
  eventType: 'ExposureUpdated';
  entityId: string; // Could be Country, Currency, Corridor, Provider, etc.
  dimension: string;
  currentExposure: number;
  projectedExposure: number;
}

export interface SettlementWindowOpened extends DomainEvent {
  eventType: 'SettlementWindowOpened';
  windowId: string;
  corridor: string;
}

export interface SettlementWindowClosed extends DomainEvent {
  eventType: 'SettlementWindowClosed';
  windowId: string;
  corridor: string;
}

export interface NettingStarted extends DomainEvent {
  eventType: 'NettingStarted';
  level: string; // Customer, Merchant, Provider, Country, Currency, etc.
}

export interface NettingCompleted extends DomainEvent {
  eventType: 'NettingCompleted';
  level: string;
  obligationsProcessed: number;
  netObligationsProduced: number;
}

export interface SettlementPlanned extends DomainEvent {
  eventType: 'SettlementPlanned';
  planId: string;
}

export interface SettlementInstructionCreated extends DomainEvent {
  eventType: 'SettlementInstructionCreated';
  instructionId: string;
  settlementId: string;
}

export interface SettlementInstructionCancelled extends DomainEvent {
  eventType: 'SettlementInstructionCancelled';
  instructionId: string;
  reason: string;
}

export interface SettlementInstructionExecuted extends DomainEvent {
  eventType: 'SettlementInstructionExecuted';
  instructionId: string;
}

export interface SettlementConfirmed extends DomainEvent {
  eventType: 'SettlementConfirmed';
  settlementId: string;
}

export interface SettlementFailed extends DomainEvent {
  eventType: 'SettlementFailed';
  settlementId: string;
  reason: string;
}

export interface SettlementRolledBack extends DomainEvent {
  eventType: 'SettlementRolledBack';
  settlementId: string;
}

export interface SettlementCompressed extends DomainEvent {
  eventType: 'SettlementCompressed';
  originalCount: number;
  compressedCount: number;
}

export interface ExposureLimitExceeded extends DomainEvent {
  eventType: 'ExposureLimitExceeded';
  entityId: string;
  dimension: string;
  limitType: string;
  excessAmount: number;
}

export interface EmergencySettlementTriggered extends DomainEvent {
  eventType: 'EmergencySettlementTriggered';
  reason: string;
}
