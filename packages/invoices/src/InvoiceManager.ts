import { IEventBus } from '@payment-os/event-bus';

export class InvoiceManager {
  constructor(private bus: IEventBus) {}

  public async createInvoice(merchantId: string, customerId: string, amount: number, currency: string): Promise<string> {
    const invoiceId = crypto.randomUUID();

    await this.bus.publish('payment.domain.invoices.invoicecreated', {
      eventId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      aggregateId: invoiceId,
      aggregateType: 'Invoice',
      eventType: 'InvoiceCreated',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'InvoiceManager',
      payload: {
        invoiceId,
        merchantId,
        customerId,
        amount,
        currency,
        status: 'DRAFT'
      },
      headers: {}
    });

    return invoiceId;
  }
}
