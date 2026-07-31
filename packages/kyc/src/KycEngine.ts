import { IEventBus } from '@payment-os/event-bus';

export interface KycRecord {
  identityId: string;
  status: 'PENDING' | 'RUNNING' | 'VERIFIED' | 'REJECTED' | 'MANUAL_REVIEW' | 'EXPIRED';
  documentType: 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID' | 'RESIDENCE_PERMIT';
  riskClassification: string;
  pepMatch: boolean;
}

export class KycEngine {
  constructor(private bus: IEventBus) {}

  public async evaluateKyc(identityId: string, record: KycRecord): Promise<void> {
    record.status = 'VERIFIED';
    
    // Simulate PEP match forcing manual review
    if (record.pepMatch) {
      record.status = 'MANUAL_REVIEW';
    }

    await this.bus.publish('payment.domain.compliance.kyccompleted', {
      eventId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      aggregateId: identityId,
      aggregateType: 'Identity',
      eventType: 'KycCompleted',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'KycEngine',
      payload: record,
      headers: {}
    });
  }
}
