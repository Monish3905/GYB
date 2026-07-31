import { IMessageBroker } from '@payment-os/message-broker';
import { IntegrationEvent } from '@payment-os/event-contracts';

export class RedisStreamsBroker implements IMessageBroker {
  public async connect(): Promise<void> {}
  public async disconnect(): Promise<void> {}
  public async publish(topic: string, event: IntegrationEvent): Promise<void> {}
  public async publishBatch(topic: string, events: IntegrationEvent[]): Promise<void> {}
  public async subscribe(topic: string, groupId: string, handler: (event: IntegrationEvent) => Promise<void>): Promise<void> {}
  public async ack(event: IntegrationEvent): Promise<void> {}
  public async nack(event: IntegrationEvent, reason: string): Promise<void> {}
  public async retry(event: IntegrationEvent): Promise<void> {}
  public async deadLetter(event: IntegrationEvent, reason: string): Promise<void> {}
  public async health(): Promise<boolean> { return true; }
  public async metrics(): Promise<any> { return {}; }
}
