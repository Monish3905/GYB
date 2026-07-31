import { IntegrationEvent } from '@payment-os/event-contracts';

export interface IMessageBroker {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish(topic: string, event: IntegrationEvent): Promise<void>;
  publishBatch(topic: string, events: IntegrationEvent[]): Promise<void>;
  subscribe(topic: string, groupId: string, handler: (event: IntegrationEvent) => Promise<void>): Promise<void>;
  ack(event: IntegrationEvent): Promise<void>;
  nack(event: IntegrationEvent, reason: string): Promise<void>;
  retry(event: IntegrationEvent): Promise<void>;
  deadLetter(event: IntegrationEvent, reason: string): Promise<void>;
  health(): Promise<boolean>;
  metrics(): Promise<any>;
}
