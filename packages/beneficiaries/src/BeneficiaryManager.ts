import { IEventBus } from '@payment-os/event-bus';

export class BeneficiaryManager {
  constructor(private bus: IEventBus) {}

  public async addBeneficiary(customerId: string, accountDetails: any): Promise<string> {
    const beneficiaryId = crypto.randomUUID();

    await this.bus.publish('payment.domain.beneficiaries.beneficiaryadded', {
      eventId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      aggregateId: beneficiaryId,
      aggregateType: 'Beneficiary',
      eventType: 'BeneficiaryAdded',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'BeneficiaryManager',
      payload: { beneficiaryId, customerId, accountDetails, status: 'VERIFIED' },
      headers: {}
    });

    return beneficiaryId;
  }
}
