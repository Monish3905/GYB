import { IEventBus } from '@payment-os/event-bus';

export class WalletService {
  constructor(private bus: IEventBus) {}

  public async createWallet(ownerId: string, currency: string, walletType: 'MERCHANT' | 'CUSTOMER'): Promise<string> {
    const walletId = crypto.randomUUID();

    // In a real system, insert into DB here.
    // Balances are NOT stored here, they are queried from the Ledger Read Models.

    await this.bus.publish('payment.domain.wallets.walletcreated', {
      eventId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      aggregateId: walletId,
      aggregateType: 'Wallet',
      eventType: 'WalletCreated',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'WalletService',
      payload: {
        walletId,
        ownerId,
        currency,
        walletType,
        status: 'ACTIVE'
      },
      headers: {}
    });

    return walletId;
  }
}
