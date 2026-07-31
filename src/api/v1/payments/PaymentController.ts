import { PaymentOrchestrator, PaymentRequest } from '../../../domains/transaction/services/PaymentOrchestrator';
import { Decimal } from '../../../shared/types';
import { globalEventBus } from '../../../infrastructure/eventbus/EventBus';

// Stubbed dependencies for DI setup
import { WalletService } from '../../../domains/wallet/services/WalletService';
import { LedgerService } from '../../../domains/ledger/services/LedgerService';
import { RoutingEngine } from '../../../domains/routing/services/RoutingEngine';
import { TreasuryService } from '../../../domains/treasury/services/TreasuryService';
import { MockSettlementProvider } from '../../../domains/settlement/providers/MockSettlementProvider';
import { InternalRailProvider } from '../../../domains/settlement/providers/InternalRailProvider';
import { ISettlementProvider } from '../../../domains/settlement/providers/ISettlementProvider';

export class PaymentController {
  private orchestrator: PaymentOrchestrator;

  constructor() {
    // In a real app, these are injected via a DI container (e.g. InversifyJS or TypeDI)
    // We instantiate stubs/mocks here to wire up the API for the internal rail milestone.
    const walletService = new WalletService({} as any);
    const ledgerService = new LedgerService({} as any, {} as any);
    const treasuryService = new TreasuryService({} as any);
    
    const mockProvider = new MockSettlementProvider();
    const internalProvider = new InternalRailProvider(treasuryService);
    
    const providers = new Map<string, ISettlementProvider>();
    providers.set('MockSettlementProvider', mockProvider);
    providers.set('InternalRailProvider', internalProvider);

    const routingEngine = new RoutingEngine([mockProvider, internalProvider], treasuryService);

    this.orchestrator = new PaymentOrchestrator(
      walletService,
      ledgerService,
      routingEngine,
      providers,
      globalEventBus
    );
  }

  /**
   * POST /api/v1/payments
   * Initiates a new payment transfer
   */
  async createPayment(req: any, res: any) {
    try {
      const body = req.body;
      
      const request: PaymentRequest = {
        userId: body.userId,
        senderWalletId: body.senderWalletId,
        recipientWalletId: body.recipientWalletId,
        amount: new Decimal(body.amount),
        fromCurrency: body.fromCurrency,
        toCurrency: body.toCurrency,
        senderCountry: body.senderCountry,
        recipientCountry: body.recipientCountry,
        metadata: body.metadata
      };

      const result = await this.orchestrator.initiatePayment(request);
      
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error("[PaymentController] Error processing payment", error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Payment initiation failed'
      });
    }
  }
}
