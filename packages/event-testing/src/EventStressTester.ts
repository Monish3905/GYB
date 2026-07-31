import { EventBus } from '@payment-os/event-bus';
import { PostgresOutboxBroker } from '@payment-os/postgres-outbox';
import { EventValidator } from '@payment-os/event-validator';
import { DLQManager } from '@payment-os/dead-letter-queue';
import { RetryEngine } from '@payment-os/retry-queue';
import { OutboxDispatcher } from '@payment-os/message-dispatcher';
import { EventMonitor } from '@payment-os/message-monitor';
import { IntegrationEvent } from '@payment-os/event-contracts';

export class EventStressTester {
  public async simulateMassiveThroughput(eventCount: number): Promise<void> {
    console.log(`Starting MS10 Event Streaming Stress Test: ${eventCount} events`);
    
    const broker = new PostgresOutboxBroker();
    const validator = new EventValidator();
    const bus = new EventBus(broker, validator);
    const monitor = new EventMonitor();

    // Setup subscriber (Consumer)
    await bus.subscribe('payment.domain.ledger.journalposted', 'ledger-consumer-group', async (event: IntegrationEvent) => {
      const startMs = Date.now();
      // Simulate processing
      monitor.recordConsume(Date.now() - startMs);
    });

    // Simulate Producers
    const startTime = Date.now();
    for (let i = 0; i < eventCount; i++) {
      const pubStart = Date.now();
      const event: IntegrationEvent = {
        eventId: `evt-${i}`,
        correlationId: `corr-${i}`,
        traceId: `trace-${i}`,
        aggregateId: `jnl-${i}`,
        aggregateType: 'Ledger',
        eventType: 'JournalPosted',
        version: 'v1',
        occurredAt: new Date(),
        producer: 'StressTester',
        payload: { amount: 100 },
        headers: {}
      };

      await bus.publish('payment.domain.ledger.journalposted', event);
      monitor.recordPublish(Date.now() - pubStart);
    }

    const endTime = Date.now();
    console.log(`Processed ${eventCount} events in ${endTime - startTime}ms`);
    console.log('Metrics:', monitor.getMetrics());
  }
}
