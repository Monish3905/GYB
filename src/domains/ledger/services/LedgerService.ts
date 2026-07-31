import { Decimal } from '../../../shared/types';
import { LedgerEntry } from '../models/LedgerModels';
import { ILedgerRepository } from '../repositories/ILedgerRepository';
import { ITransactionRepository } from '../repositories/ITransactionRepository';

export class LedgerService {
  constructor(
    private ledgerRepo: ILedgerRepository,
    private txnRepo: ITransactionRepository
  ) {}

  /**
   * Creates provisional ledger entries for a transaction.
   * This is called when funds are put on hold but settlement hasn't completed.
   */
  async createProvisionalEntries(params: {
    transactionId: string;
    debitAccountId: string;
    creditAccountId: string;
    amount: Decimal;
    currency: string;
    description: string;
  }): Promise<LedgerEntry[]> {
    if (params.amount.toNumber() <= 0) {
      throw new Error("Ledger entry amount must be strictly positive");
    }

    const entriesToCreate = [
      {
        transactionId: params.transactionId,
        debitAccountId: params.debitAccountId,
        creditAccountId: params.creditAccountId, // Often a suspense/hold account
        amount: params.amount,
        currency: params.currency,
        status: 'provisional' as const,
        description: params.description
      }
    ];

    // In a real DB transaction, this must ensure atomicity
    return this.ledgerRepo.recordEntries(entriesToCreate);
  }

  /**
   * Finalizes the provisional entries by marking them as committed
   * and recording the final settlement reference.
   */
  async finalizeEntries(params: {
    transactionId: string;
    settlementReference: string;
  }): Promise<void> {
    // Note: In real implementation, we would query the provisional entries by transactionId,
    // verify them, and update their status and settlement reference in a single DB transaction.
    // Assuming ILedgerRepository provides a way to update by transactionId, 
    // or we fetch them first.
    
    // Stub: 
    // await this.ledgerRepo.updateEntriesByTxnId(params.transactionId, 'committed', params.settlementReference);
  }

  /**
   * Complex cross-currency entries (e.g. USD to INR)
   */
  async recordCrossCurrencyEntries(params: {
    transactionId: string;
    debitAccountId: string;
    creditAccountId: string;
    fromAmount: Decimal;
    fromCurrency: string;
    toAmount: Decimal;
    toCurrency: string;
    fxRate: Decimal;
    description: string;
  }): Promise<LedgerEntry[]> {
    // For cross currency, we often need internal FX treasury accounts to balance the ledger per currency.
    // Simple version: just record the rate on a single entry, assuming the DB handles it,
    // OR create 4 entries (Debit Sender USD, Credit Treasury USD, Debit Treasury INR, Credit Receiver INR).
    
    const entry = {
      transactionId: params.transactionId,
      debitAccountId: params.debitAccountId,
      creditAccountId: params.creditAccountId,
      amount: params.fromAmount,
      currency: params.fromCurrency,
      fxRate: params.fxRate,
      status: 'provisional' as const,
      description: params.description
    };
    
    return this.ledgerRepo.recordEntries([entry]);
  }
}
