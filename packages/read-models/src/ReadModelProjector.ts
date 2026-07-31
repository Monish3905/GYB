import { IDatabase } from '@payment-os/database';
import { IUnitOfWork } from '@payment-os/unit-of-work';

export class ReadModelProjector {
  constructor(private db: IDatabase) {}

  public async updateWalletBalance(walletId: string, delta: number, uow?: IUnitOfWork): Promise<void> {
    const conn = uow ? uow.getConnection() : this.db;
    
    // Updates the read model synchronously during the transaction
    const sql = `
      INSERT INTO WalletBalances (wallet_id, balance, last_updated) 
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (wallet_id) 
      DO UPDATE SET balance = WalletBalances.balance + EXCLUDED.balance, last_updated = CURRENT_TIMESTAMP
    `;
    await conn.execute(sql, [walletId, delta]);
  }

  public async getWalletBalance(walletId: string): Promise<number> {
    const sql = `SELECT balance FROM WalletBalances WHERE wallet_id = $1`;
    const rows = await this.db.query(sql, [walletId]);
    return rows.length > 0 ? rows[0].balance : 0;
  }
}
