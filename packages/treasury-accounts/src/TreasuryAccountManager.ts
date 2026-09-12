export enum AccountType {
  NOSTRO = 'NOSTRO',
  VOSTRO = 'VOSTRO',
  RESERVE = 'RESERVE',
  SETTLEMENT = 'SETTLEMENT',
  BLOCKCHAIN = 'BLOCKCHAIN'
}

export interface TreasuryAccount {
  id: string;
  name: string;
  currency: string;
  type: AccountType;
  balance: number;
}

export class TreasuryAccountManager {
  public async getAccountBalance(accountId: string): Promise<number> {
    return 100000;
  }

  public async registerAccount(account: Omit<TreasuryAccount, 'id' | 'balance'>): Promise<TreasuryAccount> {
    return {
      id: `acc-${Date.now()}`,
      balance: 0,
      ...account
    };
  }
}
