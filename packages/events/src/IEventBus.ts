export interface DomainEvent {
  eventId: string;
  timestamp: Date;
  eventType: string;
  correlationId?: string;
}

export interface IEventBus {
  publish<T extends DomainEvent>(event: T): Promise<void>;
  subscribe<T extends DomainEvent>(eventType: string, handler: (event: T) => Promise<void>): void;
}
