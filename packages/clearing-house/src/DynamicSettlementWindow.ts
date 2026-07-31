import { IEventBus } from '@payment-os/events';

export type WindowDuration = 'IMMEDIATE' | '5M' | '15M' | '30M' | 'HOURLY' | 'DAILY' | 'ADAPTIVE' | 'EMERGENCY';

export interface WindowConfig {
  duration: WindowDuration;
  corridor: string;
}

export class DynamicSettlementWindow {
  private activeWindows: Map<string, { config: WindowConfig, startTime: Date }> = new Map();

  constructor(private eventBus: IEventBus) {}

  public async openWindow(windowId: string, config: WindowConfig): Promise<void> {
    this.activeWindows.set(windowId, { config, startTime: new Date() });
    
    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'SettlementWindowOpened',
      windowId,
      corridor: config.corridor
    } as any);
  }

  public async closeWindow(windowId: string): Promise<void> {
    const window = this.activeWindows.get(windowId);
    if (window) {
      this.activeWindows.delete(windowId);
      await this.eventBus.publish({
        eventId: crypto.randomUUID(),
        timestamp: new Date(),
        eventType: 'SettlementWindowClosed',
        windowId,
        corridor: window.config.corridor
      } as any);
    }
  }

  public getActiveWindows(): Array<{ windowId: string, config: WindowConfig, startTime: Date }> {
    return Array.from(this.activeWindows.entries()).map(([windowId, data]) => ({
      windowId,
      ...data
    }));
  }
}
