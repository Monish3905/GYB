import { BalanceProjector } from '@payment-os/ledger-projections';
import { ChartOfAccounts } from '@payment-os/chart-of-accounts';
import { Ledger } from '@payment-os/ledger';
import { IEventBus } from '@payment-os/events';

export interface TrialBalanceReport {
  periodStart: Date;
  periodEnd: Date;
  accounts: {
    accountId: string;
    code: string;
    name: string;
    debitBalance: number;
    creditBalance: number;
  }[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
}

export class TrialBalanceGenerator {
  constructor(
    private ledger: Ledger,
    private projector: BalanceProjector,
    private coa: ChartOfAccounts,
    private eventBus: IEventBus
  ) {}

  public async generateTrialBalance(periodStart: Date, periodEnd: Date): Promise<TrialBalanceReport> {
    const allJournals = this.ledger.getAllJournals();
    const periodJournals = allJournals.filter(j => j.timestamp >= periodStart && j.timestamp <= periodEnd);
    
    const balances = this.projector.projectBalances(periodJournals);
    
    let totalDebits = 0;
    let totalCredits = 0;
    const accountRows: any[] = [];

    for (const [accountId, balance] of balances.entries()) {
      if (balance === 0) continue;

      const account = this.coa.getAccount(accountId);
      if (!account) continue;

      let debitBalance = 0;
      let creditBalance = 0;

      if (account.type === 'ASSET' || account.type === 'EXPENSE') {
        if (balance > 0) debitBalance = balance;
        else creditBalance = Math.abs(balance);
      } else {
        if (balance > 0) creditBalance = balance;
        else debitBalance = Math.abs(balance);
      }

      totalDebits += debitBalance;
      totalCredits += creditBalance;

      accountRows.push({
        accountId,
        code: account.code,
        name: account.name,
        debitBalance,
        creditBalance
      });
    }

    // Floating point comparison
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.000001;

    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'TrialBalanceGenerated',
      periodStart,
      periodEnd
    } as any);

    return {
      periodStart,
      periodEnd,
      accounts: accountRows,
      totalDebits,
      totalCredits,
      isBalanced
    };
  }
}
