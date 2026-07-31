import { Account } from '@payment-os/accounts';

export class ChartOfAccounts {
  private accounts: Map<string, Account> = new Map();
  private childrenMap: Map<string, string[]> = new Map();

  public registerAccount(account: Account): void {
    if (this.accounts.has(account.accountId)) {
      throw new Error(`Account ${account.accountId} already exists in COA.`);
    }
    
    this.accounts.set(account.accountId, account);
    
    if (account.parentAccountId) {
      if (!this.accounts.has(account.parentAccountId)) {
        throw new Error(`Parent account ${account.parentAccountId} not found.`);
      }
      
      const children = this.childrenMap.get(account.parentAccountId) || [];
      children.push(account.accountId);
      this.childrenMap.set(account.parentAccountId, children);
    }
  }

  public getAccount(accountId: string): Account | undefined {
    return this.accounts.get(accountId);
  }

  public getChildren(accountId: string): Account[] {
    const childrenIds = this.childrenMap.get(accountId) || [];
    return childrenIds.map(id => this.accounts.get(id)!);
  }

  public getAllAccounts(): Account[] {
    return Array.from(this.accounts.values());
  }
}
