import { Transaction, TransactionStatus } from '../models/LedgerModels';

export interface ITransactionRepository {
  /** Find a transaction by ID */
  getById(id: string): Promise<Transaction | null>;
  
  /** Create a new transaction */
  create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction>;
  
  /** Update transaction status */
  updateStatus(id: string, status: TransactionStatus): Promise<Transaction>;
  
  /** Update settlement details on a transaction */
  updateSettlement(id: string, provider: string, reference: string, cost: number): Promise<Transaction>;
  
  /** Save arbitrary metadata updates to transaction */
  updateMetadata(id: string, metadata: object): Promise<Transaction>;
}
