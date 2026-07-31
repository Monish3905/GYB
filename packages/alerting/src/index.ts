import { IEventBus } from '@payment-os/event-bus';
export interface Alert { alertId: string; severity: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'; message: string; entityId: string; entityType: string; timestamp: Date; }
export class AlertingEngine {
  constructor(private bus: IEventBus) {}
  public async sendAlert(alert: Alert): Promise<void> {
    await this.bus.publish(payment.domain.compliance.alert., {
      eventId: crypto.randomUUID(), correlationId: alert.alertId, traceId: crypto.randomUUID(),
      aggregateId: alert.entityId, aggregateType: alert.entityType, eventType: 'AlertGenerated',
      version: 'v1', occurredAt: alert.timestamp, producer: 'AlertingEngine', payload: alert, headers: {}
    });
  }
}
