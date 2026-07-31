import { IEventBus } from '@payment-os/event-bus';

export interface MerchantProfile {
  merchantId: string;
  businessName: string;
  taxId: string;
  country: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}

export class MerchantService {
  constructor(private bus: IEventBus) {}

  public async registerMerchant(request: { businessName: string; taxId: string; country: string }): Promise<string> {
    const merchantId = crypto.randomUUID();

    const profile: MerchantProfile = {
      merchantId,
      businessName: request.businessName,
      taxId: request.taxId,
      country: request.country,
      status: 'PENDING'
    };

    // In a real system, persist to DB here.

    await this.bus.publish('payment.domain.merchants.merchantcreated', {
      eventId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      aggregateId: merchantId,
      aggregateType: 'Merchant',
      eventType: 'MerchantCreated',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'MerchantService',
      payload: profile,
      headers: {}
    });

    return merchantId;
  }
}
