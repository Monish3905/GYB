import { IntegrationEvent } from '@payment-os/event-contracts';
import { IMessageBroker } from '@payment-os/message-broker';
import { EventValidator } from '@payment-os/event-validator';

export interface IEventBus {
  publish(topic: string, event: IntegrationEvent): Promise<void>;
  publishBatch(topic: string, events: IntegrationEvent[]): Promise<void>;
  subscribe(topic: string, groupId: string, handler: (event: IntegrationEvent) => Promise<void>): Promise<void>;
  unsubscribe(topic: string, groupId: string): Promise<void>;
  replay(aggregateId: string): Promise<void>;
}

export class EventBus implements IEventBus {
  constructor(
    private broker: IMessageBroker,
    private validator: EventValidator
  ) {}

  public async publish(topic: string, event: IntegrationEvent): Promise<void> {
    this.validator.validate(event);
    await this.broker.publish(topic, event);
  }

  public async publishBatch(topic: string, events: IntegrationEvent[]): Promise<void> {
    for (const event of events) {
      this.validator.validate(event);
    }
    await this.broker.publishBatch(topic, events);
  }

  public async subscribe(topic: string, groupId: string, handler: (event: IntegrationEvent) => Promise<void>): Promise<void> {
    await this.broker.subscribe(topic, groupId, async (event: IntegrationEvent) => {
      try {
        await handler(event);
        await this.broker.ack(event);
      } catch (err: any) {
        await this.broker.nack(event, err.message);
      }
    });
  }

  public async unsubscribe(topic: string, groupId: string): Promise<void> {
    // Adapter implementation specific
  }

  public async replay(aggregateId: string): Promise<void> {
    // Delegation to EventReplayEngine later
  }
}
