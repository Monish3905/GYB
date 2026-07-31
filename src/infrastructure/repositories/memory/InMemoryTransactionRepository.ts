import { ITransactionRepository } from '../../../domains/ledger/repositories/ITransactionRepository';
import { Transaction, TransactionStatus } from '../../../domains/ledger/models/LedgerModels';
import { Decimal } from '../../../shared/types';

export class InMemoryTransactionRepository implements ITransactionRepository {
  private transactions: Map<string, Transaction> = new Map();

  async getById(id: string): Promise<Transaction | null> {
    return this.transactions.get(id) || null;
  }

  async create(txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const id = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date();
    const tx: Transaction = {
      ...txData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.transactions.set(id, tx);
    return tx;
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    const tx = this.transactions.get(id);
    if (!tx) throw new Error("Transaction not found");
    
    tx.status = status;
    tx.updatedAt = new Date();
    if (status === 'completed' || status === 'failed') {
      tx.completedAt = new Date();
    }
    
    return tx;
  }

  async updateSettlement(id: string, provider: string, reference: string, cost: number): Promise<Transaction> {
    const tx = this.transactions.get(id);
    if (!tx) throw new Error("Transaction not found");

    tx.settlementProvider = provider;
    tx.settlementReference = reference;
    tx.actualCostUSD = new Decimal(cost);
    tx.updatedAt = new Date();

    return tx;
  }

  async updateMetadata(id: string, metadata: object): Promise<Transaction> {
    const tx = this.transactions.get(id);
    if (!tx) throw new Error("Transaction not found");

    tx.metadata = { ...tx.metadata, ...metadata };
    tx.updatedAt = new Date();

    return tx;
  }
}
