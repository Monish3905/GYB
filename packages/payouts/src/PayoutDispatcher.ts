import { IEventBus } from '@payment-os/event-bus';

export class PayoutDispatcher {
  constructor(private bus: IEventBus) {}

  public async scheduleBatch(merchantId: string, payouts: { beneficiaryId: string; amount: number; currency: string }[]): Promise<string> {
    const batchId = crypto.randomUUID();

    await this.bus.publish('payment.domain.payouts.batchcreated', {
      eventId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      aggregateId: batchId,
      aggregateType: 'PayoutBatch',
      eventType: 'PayoutBatchCreated',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'PayoutDispatcher',
      payload: { batchId, merchantId, totalCount: payouts.length, status: 'SCHEDULED' },
      headers: {}
    });

    return batchId;
  }
}
