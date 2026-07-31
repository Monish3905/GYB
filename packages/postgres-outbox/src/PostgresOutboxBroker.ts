import { IMessageBroker } from '@payment-os/message-broker';
import { IntegrationEvent } from '@payment-os/event-contracts';

export class PostgresOutboxBroker implements IMessageBroker {
  private handlers: Map<string, Array<(event: IntegrationEvent) => Promise<void>>> = new Map();

  public async connect(): Promise<void> { console.log("PostgresOutbox connected"); }
  public async disconnect(): Promise<void> { console.log("PostgresOutbox disconnected"); }
  
  public async publish(topic: string, event: IntegrationEvent): Promise<void> {
    const handlers = this.handlers.get(topic) || [];
    for (const handler of handlers) {
      await handler(event);
    }
  }
  
  public async publishBatch(topic: string, events: IntegrationEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(topic, event);
    }
  }
  
  public async subscribe(topic: string, groupId: string, handler: (event: IntegrationEvent) => Promise<void>): Promise<void> {
    const current = this.handlers.get(topic) || [];
    current.push(handler);
    this.handlers.set(topic, current);
  }

  public async ack(event: IntegrationEvent): Promise<void> {}
  public async nack(event: IntegrationEvent, reason: string): Promise<void> {}
  public async retry(event: IntegrationEvent): Promise<void> {}
  public async deadLetter(event: IntegrationEvent, reason: string): Promise<void> {}
  
  public async health(): Promise<boolean> { return true; }
  public async metrics(): Promise<any> { return {}; }
}
