import { PaymentOrchestrator, PaymentRequest } from '../../../domains/transaction/services/PaymentOrchestrator';
import { Decimal } from '../../../shared/types';
import { globalEventBus } from '../../../infrastructure/eventbus/EventBus';

// Real dependencies
import { WalletService } from '../../../domains/wallet/services/WalletService';
import { LedgerService } from '../../../domains/ledger/services/LedgerService';
import { RoutingEngine } from '../../../domains/routing/services/RoutingEngine';
import { TreasuryService } from '../../../domains/treasury/services/TreasuryService';
import { PostgresWalletRepository } from '../../../infrastructure/repositories/postgres/PostgresWalletRepository';
import { PostgresLedgerRepository } from '../../../infrastructure/repositories/postgres/PostgresLedgerRepository';
import { PostgresTransactionRepository } from '../../../infrastructure/repositories/postgres/PostgresTransactionRepository';
import { BlockchainSettlementAdapter } from '../../../domains/settlement/providers/BlockchainSettlementAdapter';
import { SolanaProvider } from '../../../../packages/blockchain-sdk/src/providers/solana/SolanaProvider';
import { ISettlementProvider } from '../../../domains/settlement/providers/ISettlementProvider';

export class PaymentController {
  private orchestrator: PaymentOrchestrator;

  constructor() {
    // Instantiate real repositories
    const walletRepo = new PostgresWalletRepository();
    const ledgerRepo = new PostgresLedgerRepository();
    const txnRepo = new PostgresTransactionRepository();
    
    // Instantiate real services
    const walletService = new WalletService(walletRepo);
    const ledgerService = new LedgerService(ledgerRepo, txnRepo);
    // Note: Treasury is stubbed repository-wise for this milestone, but it exists
    const treasuryService = new TreasuryService({} as any);
    
    // Set up Solana Provider for blockchain settlement
    // Using Devnet for current milestone
    const solanaProvider = new SolanaProvider('https://api.devnet.solana.com');
    // Ensure initialized asynchronously or handle appropriately in real system
    solanaProvider.initialize().catch(err => console.error("Solana init failed", err));
    
    const blockchainAdapter = new BlockchainSettlementAdapter(solanaProvider, 'solana');
    
    const providers = new Map<string, ISettlementProvider>();
    providers.set('solana', blockchainAdapter);

    // Setup Routing Engine exclusively with the blockchain adapter
    const routingEngine = new RoutingEngine([blockchainAdapter], treasuryService);

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
