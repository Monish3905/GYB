import { IntegrationEvent } from '@payment-os/event-contracts';

export class EventValidator {
  public validate(event: IntegrationEvent): boolean {
    if (!event.eventId) throw new Error("Missing eventId");
    if (!event.correlationId) throw new Error("Missing correlationId");
    if (!event.eventType) throw new Error("Missing eventType");
    if (!event.version) throw new Error("Missing version");
    if (!event.occurredAt) throw new Error("Missing occurredAt");
    return true;
  }
}
