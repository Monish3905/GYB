import { IEventBus } from '@payment-os/event-bus';

export interface KybRecord {
  businessId: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  uboVerified: boolean;
  corporateDocumentsValid: boolean;
}

export class KybEngine {
  constructor(private bus: IEventBus) {}

  public async evaluateKyb(businessId: string, record: KybRecord): Promise<void> {
    record.status = (record.uboVerified && record.corporateDocumentsValid) ? 'VERIFIED' : 'REJECTED';

    await this.bus.publish('payment.domain.compliance.kybcompleted', {
      eventId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      aggregateId: businessId,
      aggregateType: 'BusinessIdentity',
      eventType: 'KybCompleted',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'KybEngine',
      payload: record,
      headers: {}
    });
  }
}
