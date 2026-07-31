export interface IntegrationEvent<T = any> {
  eventId: string;
  correlationId: string;
  traceId: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  version: string;
  occurredAt: Date;
  producer: string;
  payload: T;
  headers: Record<string, string>;
  signature?: string;
  hash?: string;
  metadata?: Record<string, any>;
}
