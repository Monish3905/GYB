import { IWalletRepository } from '../../../domains/wallet/repositories/IWalletRepository';
import { Wallet, Hold } from '../../../domains/wallet/models/WalletModels';
import { db } from '../../database/connection';
import { Decimal } from '../../../shared/types';

export class PostgresWalletRepository implements IWalletRepository {
  
  async getById(id: string): Promise<Wallet | null> {
    const res = await db.query('SELECT * FROM wallets WHERE id = $1 AND is_active = true', [id]);
    if (res.rows.length === 0) return null;
    return this.mapToWallet(res.rows[0]);
  }
  
  async getByUserIdAndCurrency(userId: string, currency: string): Promise<Wallet | null> {
    const res = await db.query('SELECT * FROM wallets WHERE user_id = $1 AND currency = $2 AND is_active = true', [userId, currency]);
    if (res.rows.length === 0) return null;
    return this.mapToWallet(res.rows[0]);
  }
  
  async create(wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt' | 'balanceAvailable' | 'balanceLocked' | 'balancePending' | 'balanceReserved' | 'balanceSettlement' | 'balanceEscrow'>): Promise<Wallet> {
    const res = await db.query(
      `INSERT INTO wallets (user_id, currency, wallet_type, blockchain_address, bank_account_id, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        wallet.userId,
        wallet.currency,
        wallet.walletType,
        wallet.blockchainAddress,
        wallet.bankAccountId,
        wallet.isActive
      ]
    );
    return this.mapToWallet(res.rows[0]);
  }
  
  async updateBalances(walletId: string, availableDelta: Decimal, lockedDelta: Decimal): Promise<Wallet> {
    // using raw SQL numeric addition ensures atomic updates
    const res = await db.query(
      `UPDATE wallets 
       SET balance_available = balance_available + $1,
           balance_locked = balance_locked + $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND is_active = true 
       RETURNING *`,
      [availableDelta.toString(), lockedDelta.toString(), walletId]
    );
    
    if (res.rows.length === 0) {
      throw new Error(`Wallet ${walletId} not found or inactive`);
    }
    
    return this.mapToWallet(res.rows[0]);
  }
  
  async createHold(hold: Omit<Hold, 'id' | 'createdAt'>): Promise<Hold> {
    // Create hold record and update locked balance atomically
    return await db.transaction(async (client) => {
      const resHold = await client.query(
        `INSERT INTO holds (wallet_id, transaction_id, amount, reason) VALUES ($1, $2, $3, $4) RETURNING *`,
        [hold.walletId, hold.transactionId, hold.amount.toString(), hold.reason]
      );
      
      const newHold = this.mapToHold(resHold.rows[0]);
      
      // Update wallet balances (move from available to locked)
      await client.query(
        `UPDATE wallets 
         SET balance_available = balance_available - $1,
             balance_locked = balance_locked + $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [hold.amount.toString(), hold.walletId]
      );
      
      return newHold;
    });
  }
  
  async releaseHold(holdId: string): Promise<Hold> {
    return await db.transaction(async (client) => {
      // Get hold
      const resHold = await client.query(`SELECT * FROM holds WHERE id = $1 AND released_at IS NULL`, [holdId]);
      if (resHold.rows.length === 0) {
        throw new Error(`Hold ${holdId} not found or already released`);
      }
      const hold = this.mapToHold(resHold.rows[0]);
      
      // Update hold
      const resUpdate = await client.query(
        `UPDATE holds SET released_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [holdId]
      );
      
      // Update wallet balances (move from locked back to available)
      await client.query(
        `UPDATE wallets 
         SET balance_available = balance_available + $1,
             balance_locked = balance_locked - $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [hold.amount.toString(), hold.walletId]
      );
      
      return this.mapToHold(resUpdate.rows[0]);
    });
  }
  
  private mapToWallet(row: any): Wallet {
    return {
      id: row.id,
      userId: row.user_id,
      currency: row.currency,
      
      // Assuming missing balances map to 0 in this simplified model since schema only has 2
      balanceAvailable: new Decimal(row.balance_available),
      balancePending: new Decimal(0),
      balanceReserved: new Decimal(0),
      balanceLocked: new Decimal(row.balance_locked),
      balanceSettlement: new Decimal(0),
      balanceEscrow: new Decimal(0),
      
      walletType: row.wallet_type,
      blockchainAddress: row.blockchain_address,
      bankAccountId: row.bank_account_id,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  private mapToHold(row: any): Hold {
    return {
      id: row.id,
      walletId: row.wallet_id,
      transactionId: row.transaction_id,
      amount: new Decimal(row.amount),
      reason: row.reason,
      createdAt: row.created_at,
      releasedAt: row.released_at
    };
  }
}
