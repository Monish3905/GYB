import { RailTransactionEngine } from '../../../packages/rail-transaction/src/RailTransactionEngine';
import { SandboxFXProvider } from '../../../packages/fx-connectivity/src/FXQuoteService';

describe('MS27 Load Testing: Remittance Web Application APIs', () => {
  it('should handle 1,000 concurrent quote and remittance creation requests without state corruption', async () => {
    const txEngine = new RailTransactionEngine();
    const fxProvider = new SandboxFXProvider();

    // 1. Concurrent Quote Requests
    const quotePromises = Array.from({ length: 1000 }).map(() => 
      fxProvider.quote('GBP', 'INR', Math.floor(Math.random() * 1000) + 100)
    );
    const quotes = await Promise.all(quotePromises);
    expect(quotes.length).toBe(1000);
    expect(quotes.every(q => q.status === 'QUOTED')).toBe(true);

    // 2. Concurrent Transaction Creations using locked quotes
    const txPromises = quotes.map(async (q, i) => {
      const locked = await fxProvider.lock(q.quoteId);
      return txEngine.createTransaction({
        customerId: `user-${i}`,
        corridor: 'UK-IN',
        amount: locked.sourceAmount,
        currency: 'GBP',
        destinationAmount: locked.destinationAmount,
        destinationCurrency: 'INR'
      });
    });

    const transactions = await Promise.all(txPromises);
    expect(transactions.length).toBe(1000);
    expect(transactions.every(tx => tx.status === 'CREATED')).toBe(true);
    
    // Ensure no duplicates by checking unique rail IDs
    const uniqueIds = new Set(transactions.map(tx => tx.railTransactionId));
    expect(uniqueIds.size).toBe(1000);
  });
});
