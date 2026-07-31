import { Wallet, Hold } from '../models/WalletModels';
import { Decimal } from '../../../shared/types';

export interface IWalletRepository {
  /** Find wallet by ID */
  getById(id: string): Promise<Wallet | null>;
  
  /** Find wallet by User ID and Currency */
  getByUserIdAndCurrency(userId: string, currency: string): Promise<Wallet | null>;
  
  /** Create a new wallet */
  create(wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt' | 'balanceAvailable' | 'balanceLocked'>): Promise<Wallet>;
  
  /** Update wallet balances safely (e.g. using optimistic locking or row locks) */
  updateBalances(walletId: string, availableDelta: Decimal, lockedDelta: Decimal): Promise<Wallet>;
  
  /** Create a hold on funds */
  createHold(hold: Omit<Hold, 'id' | 'createdAt'>): Promise<Hold>;
  
  /** Release a hold */
  releaseHold(holdId: string): Promise<Hold>;
}
