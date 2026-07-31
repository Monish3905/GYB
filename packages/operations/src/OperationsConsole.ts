import { IEventBus } from '@payment-os/event-bus';

export class OperationsConsole {
  constructor(private bus: IEventBus) {}

  public async forceSettlement(paymentId: string, adminUser: string, reason: string): Promise<void> {
    await this.bus.publish('payment.domain.operations.operationexecuted', {
      eventId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      aggregateId: paymentId,
      aggregateType: 'Payment',
      eventType: 'OperationExecuted',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'OperationsConsole',
      payload: { paymentId, adminUser, action: 'FORCE_SETTLEMENT', reason },
      headers: {}
    });
  }

  public async blockCustomer(customerId: string, adminUser: string, reason: string): Promise<void> {
    await this.bus.publish('payment.domain.operations.operationexecuted', {
      eventId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      aggregateId: customerId,
      aggregateType: 'Customer',
      eventType: 'OperationExecuted',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'OperationsConsole',
      payload: { customerId, adminUser, action: 'BLOCK_CUSTOMER', reason },
      headers: {}
    });
  }
}
