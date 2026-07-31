import { IEventBus } from '@payment-os/event-bus';

export interface TravelRuleRecord {
  originatorVasp: string;
  beneficiaryVasp: string;
  originatorDetails: any;
  beneficiaryDetails: any;
  transferAmount: number;
}

export class TravelRuleEngine {
  constructor(private bus: IEventBus) {}

  public async generatePayload(paymentId: string, record: TravelRuleRecord): Promise<void> {
    // Generate IVMS101 payload logic
    const payload = {
      ...record,
      ivms101: true // mock 
    };

    await this.bus.publish('payment.domain.compliance.travelrulegenerated', {
      eventId: crypto.randomUUID(),
      correlationId: paymentId,
      traceId: crypto.randomUUID(),
      aggregateId: paymentId,
      aggregateType: 'Payment',
      eventType: 'TravelRuleGenerated',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'TravelRuleEngine',
      payload,
      headers: {}
    });
  }
}
