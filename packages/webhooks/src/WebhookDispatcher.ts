import { IEventBus } from '@payment-os/event-bus';

export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  secret: string;
}

export class WebhookDispatcher {
  private subscriptions: WebhookSubscription[] = [];

  constructor(private bus: IEventBus) {
    this.subscribeToInternalBus();
  }

  public registerSubscription(sub: WebhookSubscription) {
    this.subscriptions.push(sub);
  }

  private subscribeToInternalBus() {
    // Listen for any event and fan out
    this.bus.subscribe('payment.domain.#', async (event: any) => {
      await this.dispatch(event);
    });
  }

  public async dispatch(event: any): Promise<void> {
    for (const sub of this.subscriptions) {
      if (sub.events.includes('*') || sub.events.includes(event.eventType)) {
        await this.deliver(sub, event);
      }
    }
  }

  private async deliver(sub: WebhookSubscription, event: any): Promise<void> {
    const deliveryId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    // In a real system, we'd HMAC SHA256 the payload with the secret
    const signature = 'sha256=mocked_signature_hash';

    try {
      // Mocked HTTP POST
      // await axios.post(sub.url, event, { headers: { 'x-webhook-signature': signature, 'x-webhook-delivery-id': deliveryId } })
      
      await this.bus.publish('payment.domain.api.webhookdelivered', {
        eventId: crypto.randomUUID(),
        correlationId: event.correlationId,
        traceId: crypto.randomUUID(),
        aggregateId: sub.id,
        aggregateType: 'Webhook',
        eventType: 'WebhookDelivered',
        version: 'v1',
        occurredAt: new Date(),
        producer: 'WebhookDispatcher',
        payload: {
          deliveryId,
          webhookId: sub.id,
          eventId: event.eventId
        },
        headers: {}
      });
    } catch (err) {
      await this.bus.publish('payment.domain.api.webhookfailed', {
        eventId: crypto.randomUUID(),
        correlationId: event.correlationId,
        traceId: crypto.randomUUID(),
        aggregateId: sub.id,
        aggregateType: 'Webhook',
        eventType: 'WebhookFailed',
        version: 'v1',
        occurredAt: new Date(),
        producer: 'WebhookDispatcher',
        payload: {
          deliveryId,
          webhookId: sub.id,
          eventId: event.eventId,
          error: String(err)
        },
        headers: {}
      });
    }
  }
}
