import { IEventBus } from '@payment-os/event-bus';

export interface CustomerProfile {
  customerId: string;
  fullName: string;
  email: string;
  country: string;
  status: 'ACTIVE' | 'BLOCKED';
}

export class CustomerService {
  constructor(private bus: IEventBus) {}

  public async registerCustomer(request: { fullName: string; email: string; country: string }): Promise<string> {
    const customerId = crypto.randomUUID();

    const profile: CustomerProfile = {
      customerId,
      fullName: request.fullName,
      email: request.email,
      country: request.country,
      status: 'ACTIVE'
    };

    // DB insert mock

    await this.bus.publish('payment.domain.customers.customercreated', {
      eventId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      aggregateId: customerId,
      aggregateType: 'Customer',
      eventType: 'CustomerCreated',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'CustomerService',
      payload: profile,
      headers: {}
    });

    return customerId;
  }
}
