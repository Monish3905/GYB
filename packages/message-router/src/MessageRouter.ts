import { IntegrationEvent } from '@payment-os/event-contracts';
import { IEventBus } from '@payment-os/event-bus';

export class MessageRouter {
  constructor(private bus: IEventBus) {}

  public async routeEvent(event: IntegrationEvent): Promise<void> {
    // Basic topic routing by eventType. 
    // Wildcard routing logic could be implemented here.
    const topic = `payment.domain.${event.aggregateType.toLowerCase()}.${event.eventType.toLowerCase()}`;
    await this.bus.publish(topic, event);
  }
}
