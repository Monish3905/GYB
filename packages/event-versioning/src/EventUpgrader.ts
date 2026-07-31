import { IntegrationEvent } from '@payment-os/event-contracts';

export interface EventUpgrader<TFrom, TTo> {
  sourceVersion: string;
  targetVersion: string;
  upgrade(event: IntegrationEvent<TFrom>): IntegrationEvent<TTo>;
}

export class VersionManager {
  private upgraders: Map<string, EventUpgrader<any, any>> = new Map();

  public registerUpgrader(upgrader: EventUpgrader<any, any>): void {
    const key = `${upgrader.sourceVersion}->${upgrader.targetVersion}`;
    this.upgraders.set(key, upgrader);
  }

  public upgradeEvent(event: IntegrationEvent, targetVersion: string): IntegrationEvent {
    if (event.version === targetVersion) return event;
    const key = `${event.version}->${targetVersion}`;
    const upgrader = this.upgraders.get(key);
    if (!upgrader) {
      throw new Error(`No upgrade path found for event type from ${event.version} to ${targetVersion}`);
    }
    return upgrader.upgrade(event);
  }
}
