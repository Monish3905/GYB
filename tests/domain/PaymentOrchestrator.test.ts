import { PaymentOrchestrator } from '../../src/domains/transaction/services/PaymentOrchestrator';
import { globalEventBus } from '../../src/infrastructure/eventbus/EventBus';
import { Decimal } from '../../src/shared/types';
import { WalletService } from '../../src/domains/wallet/services/WalletService';
import { LedgerService } from '../../src/domains/ledger/services/LedgerService';
import { RoutingEngine } from '../../src/domains/routing/services/RoutingEngine';
import { TreasuryService } from '../../src/domains/treasury/services/TreasuryService';
import { MockSettlementProvider } from '../../src/domains/settlement/providers/MockSettlementProvider';
import { InMemoryWalletRepository } from '../../src/infrastructure/repositories/memory/InMemoryWalletRepository';
import { InMemoryLedgerRepository } from '../../src/infrastructure/repositories/memory/InMemoryLedgerRepository';
import { InMemoryTransactionRepository } from '../../src/infrastructure/repositories/memory/InMemoryTransactionRepository';
import { InMemoryTreasuryRepository } from '../../src/infrastructure/repositories/memory/InMemoryTreasuryRepository';
import { ISettlementProvider } from '../../src/domains/settlement/providers/ISettlementProvider';

describe('PaymentOrchestrator In-Memory End-to-End', () => {
  let orchestrator: PaymentOrchestrator;
  let walletRepo: InMemoryWalletRepository;
  let ledgerRepo: InMemoryLedgerRepository;
  let walletService: WalletService;

  beforeEach(async () => {
    walletRepo = new InMemoryWalletRepository();
    ledgerRepo = new InMemoryLedgerRepository();
    const txnRepo = new InMemoryTransactionRepository();
    const treasuryRepo = new InMemoryTreasuryRepository();

    walletService = new WalletService(walletRepo);
    const ledgerService = new LedgerService(ledgerRepo, txnRepo);
    const treasuryService = new TreasuryService(treasuryRepo);
    
    const mockProvider = new MockSettlementProvider();
    const providers = new Map<string, ISettlementProvider>();
    providers.set('MockSettlementProvider', mockProvider);

    const routingEngine = new RoutingEngine([mockProvider], treasuryService);

    orchestrator = new PaymentOrchestrator(
      walletService,
      ledgerService,
      routingEngine,
      providers,
      globalEventBus
    );
  });

  it('should complete a payment successfully via mock provider', async () => {
    // 1. Setup in-memory state
    const senderWallet = await walletRepo.create({
      userId: 'user_1',
      currency: 'USD',
      walletType: 'fiat',
      isActive: true
    });
    
    // Seed balance (mock funding)
    await walletRepo.updateBalances(senderWallet.id, new Decimal(1000), new Decimal(0));

    // 2. Initiate Payment
    const result = await orchestrator.initiatePayment({
      userId: 'user_1',
      senderWalletId: senderWallet.id,
      recipientWalletId: 'recipient_wallet_x',
      amount: new Decimal(100),
      fromCurrency: 'USD',
      toCurrency: 'INR',
      senderCountry: 'US',
      recipientCountry: 'IN'
    });

    expect(result.status).toBe('completed');
    expect(result.transactionId).toBeDefined();

    // 3. Verify in-memory state changes
    const updatedWallet = await walletRepo.getById(senderWallet.id);
    expect(updatedWallet?.balanceAvailable.toNumber()).toBe(900); // 100 reserved and committed
  });
});
