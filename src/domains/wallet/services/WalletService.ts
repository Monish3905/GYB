import { Decimal } from '../../../shared/types';
import { Wallet, Hold } from '../models/WalletModels';
import { IWalletRepository } from '../repositories/IWalletRepository';

export class WalletService {
  constructor(private walletRepo: IWalletRepository) {}

  async checkSufficientBalance(walletId: string, requiredAmount: Decimal): Promise<boolean> {
    const wallet = await this.walletRepo.getById(walletId);
    if (!wallet) throw new Error("Wallet not found");
    return wallet.balanceAvailable.compareTo(requiredAmount) >= 0;
  }

  async reserveFunds(params: { walletId: string; transactionId: string; amount: Decimal; reason: string; }): Promise<Hold> {
    const hasSufficient = await this.checkSufficientBalance(params.walletId, params.amount);
    if (!hasSufficient) throw new Error("Insufficient available balance to reserve funds");

    const hold = await this.walletRepo.createHold({
      walletId: params.walletId,
      transactionId: params.transactionId,
      amount: params.amount,
      reason: params.reason
    });

    const wallet = await this.walletRepo.getById(params.walletId);
    if(wallet) {
        // Decrease available, increase reserved
        const negAmount = new Decimal(-params.amount.toNumber());
        await this.walletRepo.updateBalances(params.walletId, negAmount, params.amount); // Need to adjust repo to handle all 6 balances
    }
    return hold;
  }

  async lockFundsForSettlement(walletId: string, holdId: string, amount: Decimal): Promise<void> {
    // In a full implementation, we move from Reserved -> Locked or Settlement
  }

  async commitFunds(walletId: string, holdId: string, amount: Decimal): Promise<void> {
    await this.walletRepo.releaseHold(holdId);
    // Deduct from locked/reserved balance permanently
  }

  async releaseFunds(walletId: string, holdId: string, amount: Decimal): Promise<void> {
    await this.walletRepo.releaseHold(holdId);
    // Move reserved back to available
  }
}
