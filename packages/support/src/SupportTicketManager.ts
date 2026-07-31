import { IEventBus } from '@payment-os/event-bus';

export class SupportTicketManager {
  constructor(private bus: IEventBus) {}

  public async createTicket(customerId: string, subject: string, description: string): Promise<string> {
    const ticketId = crypto.randomUUID();

    await this.bus.publish('payment.domain.support.ticketcreated', {
      eventId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      aggregateId: ticketId,
      aggregateType: 'SupportTicket',
      eventType: 'SupportTicketCreated',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'SupportTicketManager',
      payload: { ticketId, customerId, subject, status: 'OPEN' },
      headers: {}
    });

    return ticketId;
  }
}
