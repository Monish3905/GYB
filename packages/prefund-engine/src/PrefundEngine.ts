import { IEventBus } from '@payment-os/event-bus';

export class PrefundEngine {
  constructor(private bus: IEventBus) {}

  public async evaluateThreshold(providerId: string, currentBalance: number, thresholdAmount: number, currency: string): Promise<void> {
    if (currentBalance < thresholdAmount) {
      await this.bus.publish('payment.domain.treasury.reservethresholdreached', {
        eventId: crypto.randomUUID(),
        correlationId: crypto.randomUUID(),
        traceId: crypto.randomUUID(),
        aggregateId: providerId,
        aggregateType: 'Treasury',
        eventType: 'ReserveThresholdReached',
        version: 'v1',
        occurredAt: new Date(),
        producer: 'PrefundEngine',
        payload: { providerId, currentBalance, thresholdAmount, currency },
        headers: {}
      });
    }
  }
}
