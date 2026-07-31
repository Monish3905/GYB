import { IMessageBroker } from '@payment-os/message-broker';
import { IntegrationEvent } from '@payment-os/event-contracts';

export class KafkaBroker implements IMessageBroker {
  public async connect(): Promise<void> { console.log("Kafka connected"); }
  public async disconnect(): Promise<void> { console.log("Kafka disconnected"); }
  
  public async publish(topic: string, event: IntegrationEvent): Promise<void> {
    console.log(`Kafka Publish [${topic}]: ${event.eventId}`);
  }
  
  public async publishBatch(topic: string, events: IntegrationEvent[]): Promise<void> {
    console.log(`Kafka PublishBatch [${topic}]: ${events.length} events`);
  }
  
  public async subscribe(topic: string, groupId: string, handler: (event: IntegrationEvent) => Promise<void>): Promise<void> {
    console.log(`Kafka Subscribe [${topic}] Group [${groupId}]`);
  }

  public async ack(event: IntegrationEvent): Promise<void> {}
  public async nack(event: IntegrationEvent, reason: string): Promise<void> {}
  public async retry(event: IntegrationEvent): Promise<void> {}
  public async deadLetter(event: IntegrationEvent, reason: string): Promise<void> {}
  
  public async health(): Promise<boolean> { return true; }
  public async metrics(): Promise<any> { return {}; }
}
