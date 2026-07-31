import { IEventBus } from '@payment-os/event-bus';
import { IntegrationEvent } from '@payment-os/event-contracts';
import { DLQManager } from '@payment-os/dead-letter-queue';
import { RetryEngine } from '@payment-os/retry-queue';
// Assume OutboxRelay is available from ms9 outbox package but mocked here for interface clarity
import { OutboxRelay } from '@payment-os/outbox';

export class OutboxDispatcher {
  private isRunning: boolean = false;
  private timer?: NodeJS.Timeout;

  constructor(
    private relay: OutboxRelay,
    private bus: IEventBus,
    private dlq: DLQManager,
    private retry: RetryEngine
  ) {}

  public startPolling(intervalMs: number = 1000): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = setInterval(() => this.processPending(), intervalMs);
  }

  public stopPolling(): void {
    this.isRunning = false;
    if (this.timer) clearInterval(this.timer);
  }

  public async processPending(limit: number = 100): Promise<void> {
    if (!this.isRunning) return;

    try {
      const pendingEvents = await this.relay.fetchPendingEvents(limit);
      if (pendingEvents.length === 0) return;

      const processedIds: string[] = [];

      for (const record of pendingEvents) {
        try {
          const event: IntegrationEvent = JSON.parse(record.payload);
          const topic = `payment.domain.${event.aggregateType.toLowerCase()}.${event.eventType.toLowerCase()}`;
          
          await this.retry.executeWithRetry(async () => {
            await this.bus.publish(topic, event);
          });
          
          processedIds.push(record.event_id);
        } catch (error: any) {
          await this.dlq.moveToDLQ(record, error.message);
          processedIds.push(record.event_id); // Mark processed so we don't pick it up again, it's in DLQ now
        }
      }

      await this.relay.markProcessed(processedIds);
    } catch (err) {
      console.error("Failed to process outbox events:", err);
    }
  }
}
