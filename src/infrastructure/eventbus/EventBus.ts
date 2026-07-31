// Define all strongly typed events for the entire domain
export interface DomainEvents {
  'TransactionCreated': { transactionId: string; payload: any };
  'QuoteRequested': { transactionId: string; payload: any };
  'QuoteCalculated': { transactionId: string; quote: any };
  'ComplianceStarted': { transactionId: string };
  'CompliancePassed': { transactionId: string };
  'LiquidityReserved': { transactionId: string; holdId: string };
  'RouteSelected': { transactionId: string; route: any };
  'SettlementPrepared': { transactionId: string };
  'SettlementStarted': { transactionId: string; provider: string };
  'SettlementSubmitted': { transactionId: string; reference: string };
  'SettlementConfirmed': { transactionId: string; result: any };
  'LedgerCommitted': { transactionId: string };
  'TreasuryUpdated': { transactionId: string };
  'WalletCredited': { transactionId: string; walletId: string };
  'NotificationSent': { transactionId: string; message: string };
  'PaymentFailed': { transactionId: string; error: string };
}

export type EventName = keyof DomainEvents;

export class TypedEventBus {
  private listeners: Map<EventName, Array<(payload: any) => void>> = new Map();

  /** Subscribe to an event */
  on<K extends EventName>(event: K, callback: (payload: DomainEvents[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /** Publish an event to all subscribers asynchronously */
  emit<K extends EventName>(event: K, payload: DomainEvents[K]): void {
    // console.log(`[EventBus] Emitting event: ${event}`, payload);
    const callbacks = this.listeners.get(event) || [];
    
    // Execute immediately in memory for tests, but decouple via setImmediate
    callbacks.forEach(callback => {
      setImmediate(() => {
        try {
          callback(payload);
        } catch (err) {
          console.error(`[EventBus] Error in listener for event ${event}:`, err);
        }
      });
    });
  }
}

// Global singleton instance
export const globalEventBus = new TypedEventBus();
