import { LedgerAccount, LedgerEntry } from '../models/LedgerModels';

export interface ILedgerRepository {
  /** Find a ledger account by ID */
  getAccountById(id: string): Promise<LedgerAccount | null>;
  
  /** Find a ledger account by wallet ID */
  getAccountByWalletId(walletId: string): Promise<LedgerAccount | null>;
  
  /** Create a new ledger account */
  createAccount(account: Omit<LedgerAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<LedgerAccount>;
  
  /** 
   * Record a double entry. 
   * MUST be executed in an ACID transaction.
   * MUST ensure debits = credits if same currency, or validate FX rate.
   */
  recordEntries(entries: Omit<LedgerEntry, 'id' | 'createdAt'>[]): Promise<LedgerEntry[]>;
  
  /** Update entry status (e.g., provisional -> committed) */
  updateEntryStatus(id: string, status: 'provisional' | 'committed' | 'settled', settlementRef?: string): Promise<LedgerEntry>;
  
  /** Get trial balance (sum of debits and credits) */
  getTrialBalance(currency: string): Promise<{ totalDebits: number, totalCredits: number }>;
}
