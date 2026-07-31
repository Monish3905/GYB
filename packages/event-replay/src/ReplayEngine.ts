import { IEventBus } from '@payment-os/event-bus';

export class ReplayEngine {
  constructor(private bus: IEventBus) {}

  public async replayAggregate(aggregateId: string): Promise<void> {
    console.log(`Replaying aggregate ${aggregateId}`);
    // Fetch from EventStore and publish to bus with 'replay' metadata flag
  }

  public async replayDateRange(start: Date, end: Date): Promise<void> {
    console.log(`Replaying events from ${start.toISOString()} to ${end.toISOString()}`);
  }
}
