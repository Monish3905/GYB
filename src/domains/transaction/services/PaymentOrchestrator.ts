import { Decimal } from '../../../shared/types';
import { Transaction, TransactionStatus } from '../../ledger/models/LedgerModels';
import { WalletService } from '../../wallet/services/WalletService';
import { LedgerService } from '../../ledger/services/LedgerService';
import { RoutingEngine } from '../../routing/services/RoutingEngine';
import { ISettlementProvider } from '../../settlement/providers/ISettlementProvider';
import { TypedEventBus } from '../../../infrastructure/eventbus/EventBus';

export interface PaymentRequest {
  userId: string;
  senderWalletId: string;
  recipientWalletId: string;
  amount: Decimal;
  fromCurrency: string;
  toCurrency: string;
  senderCountry: string;
  recipientCountry: string;
  metadata?: any;
}

export class PaymentOrchestrator {
  constructor(
    private walletService: WalletService,
    private ledgerService: LedgerService,
    private routingEngine: RoutingEngine,
    private settlementProviders: Map<string, ISettlementProvider>,
    private eventBus: TypedEventBus
  ) {}

  /**
   * Main entrypoint for initiating a payment.
   * This executes the full DDD event-driven flow.
   */
  async initiatePayment(request: PaymentRequest): Promise<{ transactionId: string; status: string }> {
    const transactionId = `txn_${Date.now()}`;
    const startTime = Date.now();

    try {
      this.eventBus.emit("TransactionCreated", { transactionId, payload: request });

      // 1. Compliance Check (Stubbed for now, assume always passes)
      // If failed, throw ComplianceError
      this.eventBus.emit("CompliancePassed", { transactionId });

      // 2. Reserve Funds in User's Wallet
      const hold = await this.walletService.reserveFunds({
        walletId: request.senderWalletId,
        transactionId: transactionId,
        amount: request.amount,
        reason: "Payment Initiation"
      });
      this.eventBus.emit("LiquidityReserved", { transactionId, holdId: hold.id });

      // 3. Create Provisional Ledger Entries
      await this.ledgerService.createProvisionalEntries({
        transactionId,
        debitAccountId: `acc_${request.senderWalletId}`,
        creditAccountId: 'HOLD_ACCOUNT_XYZ',
        amount: request.amount,
        currency: request.fromCurrency,
        description: `Provisional hold for txn ${transactionId}`
      });
      
      // 4. Smart Routing
      const optimalRoute = await this.routingEngine.findOptimalRoute({
        fromCurrency: request.fromCurrency,
        toCurrency: request.toCurrency,
        amount: request.amount,
        senderCountry: request.senderCountry,
        recipientCountry: request.recipientCountry
      });
      this.eventBus.emit("RouteSelected", { transactionId, route: optimalRoute });

      // 5. Settlement Execution
      const provider = this.settlementProviders.get(optimalRoute.provider);
      if (!provider) throw new Error(`Provider ${optimalRoute.provider} not found`);

      this.eventBus.emit("SettlementStarted", { transactionId, provider: optimalRoute.provider });
      
      const settlementResult = await provider.send({
        id: `job_${transactionId}`,
        transactionId,
        providerId: optimalRoute.provider,
        settlementMethod: 'auto',
        amount: request.amount,
        currency: request.fromCurrency,
        status: 'pending',
        retryCount: 0,
        createdAt: new Date()
      });

      if (settlementResult.status === 'failed') {
        throw new Error(`Settlement failed: ${settlementResult.errorMessage}`);
      }
      this.eventBus.emit("SettlementConfirmed", { transactionId, result: settlementResult });

      // 6. Commit Ledger Entries
      await this.ledgerService.finalizeEntries({
        transactionId,
        settlementReference: settlementResult.reference
      });
      this.eventBus.emit("LedgerCommitted", { transactionId });

      // 7. Commit Funds in Wallet (permanently deduct)
      await this.walletService.commitFunds(request.senderWalletId, hold.id, request.amount);
      // In a real system, we also credit the recipient's wallet here, or treasury handles it
      
      this.eventBus.emit("WalletCredited", { transactionId, walletId: request.recipientWalletId });

      return {
        transactionId,
        status: 'completed'
      };

    } catch (error: any) {
      this.eventBus.emit("PaymentFailed", { transactionId, error: error.message });
      // Rollbacks would happen here (release hold, void ledger entries)
      throw error;
    }
  }
}
