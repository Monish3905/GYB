import { IWalletRepository } from '../../../domains/wallet/repositories/IWalletRepository';
import { Wallet, Hold } from '../../../domains/wallet/models/WalletModels';
import { Decimal } from '../../../shared/types';

export class InMemoryWalletRepository implements IWalletRepository {
  private wallets: Map<string, Wallet> = new Map();
  private holds: Map<string, Hold> = new Map();

  async getById(id: string): Promise<Wallet | null> {
    return this.wallets.get(id) || null;
  }

  async getByUserIdAndCurrency(userId: string, currency: string): Promise<Wallet | null> {
    for (const wallet of this.wallets.values()) {
      if (wallet.userId === userId && wallet.currency === currency) {
        return wallet;
      }
    }
    return null;
  }

  async create(walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt' | 'balanceAvailable' | 'balancePending' | 'balanceReserved' | 'balanceLocked' | 'balanceSettlement' | 'balanceEscrow'>): Promise<Wallet> {
    const id = `wallet_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date();
    
    const wallet: Wallet = {
      ...walletData,
      id,
      balanceAvailable: new Decimal(0),
      balancePending: new Decimal(0),
      balanceReserved: new Decimal(0),
      balanceLocked: new Decimal(0),
      balanceSettlement: new Decimal(0),
      balanceEscrow: new Decimal(0),
      createdAt: now,
      updatedAt: now
    };
    
    this.wallets.set(id, wallet);
    return wallet;
  }

  async updateBalances(walletId: string, availableDelta: Decimal, lockedDelta: Decimal): Promise<Wallet> {
    const wallet = this.wallets.get(walletId);
    if (!wallet) throw new Error("Wallet not found");

    const newAvailable = wallet.balanceAvailable.add(availableDelta);
    const newLocked = wallet.balanceLocked.add(lockedDelta);

    if (newAvailable.toNumber() < 0 || newLocked.toNumber() < 0) {
      throw new Error("Insufficient funds: balance cannot drop below zero");
    }

    wallet.balanceAvailable = newAvailable;
    wallet.balanceLocked = newLocked;
    wallet.updatedAt = new Date();

    return wallet;
  }

  async createHold(holdData: Omit<Hold, 'id' | 'createdAt'>): Promise<Hold> {
    const id = `hold_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const hold: Hold = {
      ...holdData,
      id,
      createdAt: new Date()
    };
    this.holds.set(id, hold);
    return hold;
  }

  async releaseHold(holdId: string): Promise<Hold> {
    const hold = this.holds.get(holdId);
    if (!hold) throw new Error("Hold not found");
    if (hold.releasedAt) throw new Error("Hold already released");
    
    hold.releasedAt = new Date();
    return hold;
  }
}
