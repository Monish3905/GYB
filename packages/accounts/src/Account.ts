export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'SUSPENSE';

export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED';

export interface Account {
  accountId: string;
  code: string;
  name: string;
  type: AccountType;
  currency: string;
  status: AccountStatus;
  parentAccountId?: string;
  metadata?: any;
}

export class AccountBuilder {
  private account: Partial<Account> = {
    status: 'ACTIVE'
  };

  public setId(id: string) { this.account.accountId = id; return this; }
  public setCode(code: string) { this.account.code = code; return this; }
  public setName(name: string) { this.account.name = name; return this; }
  public setType(type: AccountType) { this.account.type = type; return this; }
  public setCurrency(currency: string) { this.account.currency = currency; return this; }
  public setParent(parentId: string) { this.account.parentAccountId = parentId; return this; }
  
  public build(): Readonly<Account> {
    if (!this.account.accountId || !this.account.code || !this.account.type || !this.account.currency) {
      throw new Error("Missing required account fields");
    }
    return Object.freeze(this.account as Account);
  }
}
