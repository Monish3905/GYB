import { ILedgerRepository } from '../../../domains/ledger/repositories/ILedgerRepository';
import { LedgerAccount, LedgerEntry } from '../../../domains/ledger/models/LedgerModels';
import { Decimal } from '../../../shared/types';

export class InMemoryLedgerRepository implements ILedgerRepository {
  private accounts: Map<string, LedgerAccount> = new Map();
  private entries: Map<string, LedgerEntry> = new Map();

  async getAccountById(id: string): Promise<LedgerAccount | null> {
    return this.accounts.get(id) || null;
  }

  async getAccountByWalletId(walletId: string): Promise<LedgerAccount | null> {
    for (const acc of this.accounts.values()) {
      if (acc.walletId === walletId) return acc;
    }
    return null;
  }

  async createAccount(accountData: Omit<LedgerAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<LedgerAccount> {
    const id = `acc_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const account: LedgerAccount = {
      ...accountData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.accounts.set(id, account);
    return account;
  }

  async recordEntries(entriesData: Omit<LedgerEntry, 'id' | 'createdAt'>[]): Promise<LedgerEntry[]> {
    const createdEntries: LedgerEntry[] = [];
    const now = new Date();

    // Very strict double entry check is typically in the service, but let's do a basic check here
    for (const entryData of entriesData) {
      if (entryData.amount.toNumber() <= 0) {
        throw new Error("Ledger entry amount must be positive");
      }
      
      const entry: LedgerEntry = {
        ...entryData,
        id: `entry_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        createdAt: now
      };
      this.entries.set(entry.id, entry);
      createdEntries.push(entry);
    }

    return createdEntries;
  }

  async updateEntryStatus(id: string, status: 'provisional' | 'committed' | 'settled', settlementRef?: string): Promise<LedgerEntry> {
    const entry = this.entries.get(id);
    if (!entry) throw new Error("Ledger entry not found");
    
    // Enforce state transitions
    if (entry.status === 'committed' && status === 'provisional') {
      throw new Error("Cannot revert committed entry to provisional");
    }

    entry.status = status;
    if (settlementRef) entry.settlementReference = settlementRef;
    if (status === 'committed' && !entry.committedAt) {
      entry.committedAt = new Date();
    }
    
    return entry;
  }

  async getTrialBalance(currency: string): Promise<{ totalDebits: number; totalCredits: number; }> {
    let totalDebits = 0;
    let totalCredits = 0;

    for (const entry of this.entries.values()) {
      if (entry.currency === currency && entry.status === 'committed') {
        // Technically double entry stores debits and credits on the same row,
        // so totalDebits = sum(amounts), totalCredits = sum(amounts)
        totalDebits += entry.amount.toNumber();
        totalCredits += entry.amount.toNumber();
      }
    }

    return { totalDebits, totalCredits };
  }
}
