import { DomainEvent, IEventBus } from './IEventBus';

export class InMemoryEventBus implements IEventBus {
  private handlers: Map<string, Array<(event: any) => Promise<void>>> = new Map();

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventType) || [];
    // Execute asynchronously to simulate real message broker
    setTimeout(() => {
      eventHandlers.forEach(handler => {
        handler(event).catch(err => {
          console.error(`[EventBus] Error handling event ${event.eventType}`, err);
        });
      });
    }, 0);
  }

  subscribe<T extends DomainEvent>(eventType: string, handler: (event: T) => Promise<void>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }
}
