import { IEventBus } from '@payment-os/event-bus';

export class NotificationRouter {
  constructor(private bus: IEventBus) {}

  public async sendNotification(recipient: string, type: 'EMAIL' | 'SMS' | 'PUSH', content: string): Promise<void> {
    const notificationId = crypto.randomUUID();

    // Mock provider delivery here

    await this.bus.publish('payment.domain.notifications.notificationsent', {
      eventId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      aggregateId: notificationId,
      aggregateType: 'Notification',
      eventType: 'NotificationSent',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'NotificationRouter',
      payload: { notificationId, recipient, type, status: 'DELIVERED' },
      headers: {}
    });
  }
}
