import { IEventBus } from '@payment-os/event-bus';

export class PaymentLinkService {
  constructor(private bus: IEventBus) {}

  public async generateLink(merchantId: string, amount: number, currency: string): Promise<string> {
    const linkId = crypto.randomUUID();
    const url = `https://pay.example.com/${linkId}`;

    await this.bus.publish('payment.domain.links.linkgenerated', {
      eventId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      aggregateId: linkId,
      aggregateType: 'PaymentLink',
      eventType: 'PaymentLinkGenerated',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'PaymentLinkService',
      payload: { linkId, merchantId, amount, currency, url },
      headers: {}
    });

    return url;
  }
}
