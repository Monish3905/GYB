import { ITransactionRepository } from '../../../domains/ledger/repositories/ITransactionRepository';
import { Transaction, TransactionStatus } from '../../../domains/ledger/models/LedgerModels';
import { db } from '../../database/connection';
import { Decimal } from '../../../shared/types';

export class PostgresTransactionRepository implements ITransactionRepository {
  
  async getById(id: string): Promise<Transaction | null> {
    const res = await db.query('SELECT * FROM transactions WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return this.mapToTransaction(res.rows[0]);
  }
  
  async create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>): Promise<Transaction> {
    const res = await db.query(
      `INSERT INTO transactions 
       (user_id, sender_wallet_id, recipient_wallet_id, from_amount, from_currency, to_amount, to_currency, fx_rate, status, route_chosen, settlement_provider, settlement_reference, actual_cost_usd, cost_percentage, compliance_approved, compliance_score, compliance_check_details, error_message, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) 
       RETURNING *`,
      [
        transaction.userId,
        transaction.senderWalletId,
        transaction.recipientWalletId,
        transaction.fromAmount.toString(),
        transaction.fromCurrency,
        transaction.toAmount?.toString(),
        transaction.toCurrency,
        transaction.fxRate?.toString(),
        transaction.status,
        transaction.routeChosen,
        transaction.settlementProvider,
        transaction.settlementReference,
        transaction.actualCostUSD?.toString(),
        transaction.costPercentage?.toString(),
        transaction.complianceApproved,
        transaction.complianceScore,
        transaction.complianceCheckDetails,
        transaction.errorMessage,
        transaction.metadata
      ]
    );
    return this.mapToTransaction(res.rows[0]);
  }
  
  async updateStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    const res = await db.query(
      `UPDATE transactions 
       SET status = $1, 
           updated_at = CURRENT_TIMESTAMP, 
           completed_at = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );
    if (res.rows.length === 0) throw new Error(`Transaction ${id} not found`);
    return this.mapToTransaction(res.rows[0]);
  }
  
  async updateSettlement(id: string, provider: string, reference: string, cost: number): Promise<Transaction> {
    const res = await db.query(
      `UPDATE transactions 
       SET settlement_provider = $1, 
           settlement_reference = $2, 
           actual_cost_usd = $3, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING *`,
      [provider, reference, cost.toString(), id]
    );
    if (res.rows.length === 0) throw new Error(`Transaction ${id} not found`);
    return this.mapToTransaction(res.rows[0]);
  }
  
  async updateMetadata(id: string, metadata: object): Promise<Transaction> {
    const res = await db.query(
      `UPDATE transactions 
       SET metadata = metadata || $1::jsonb, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [metadata, id]
    );
    if (res.rows.length === 0) throw new Error(`Transaction ${id} not found`);
    return this.mapToTransaction(res.rows[0]);
  }
  
  private mapToTransaction(row: any): Transaction {
    return {
      id: row.id,
      userId: row.user_id,
      senderWalletId: row.sender_wallet_id,
      recipientWalletId: row.recipient_wallet_id,
      fromAmount: new Decimal(row.from_amount),
      fromCurrency: row.from_currency,
      toAmount: row.to_amount ? new Decimal(row.to_amount) : undefined,
      toCurrency: row.to_currency,
      fxRate: row.fx_rate ? new Decimal(row.fx_rate) : undefined,
      status: row.status,
      routeChosen: row.route_chosen,
      settlementProvider: row.settlement_provider,
      settlementReference: row.settlement_reference,
      actualCostUSD: row.actual_cost_usd ? new Decimal(row.actual_cost_usd) : undefined,
      costPercentage: row.cost_percentage ? new Decimal(row.cost_percentage) : undefined,
      complianceApproved: row.compliance_approved,
      complianceScore: row.compliance_score,
      complianceCheckDetails: row.compliance_check_details,
      errorMessage: row.error_message,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at
    };
  }
}
