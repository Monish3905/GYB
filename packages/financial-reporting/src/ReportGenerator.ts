import { BalanceEngine } from '@payment-os/balance-engine';
import { ChartOfAccounts } from '@payment-os/chart-of-accounts';
import { IEventBus } from '@payment-os/events';

export class ReportGenerator {
  constructor(
    private balanceEngine: BalanceEngine,
    private coa: ChartOfAccounts,
    private eventBus: IEventBus
  ) {}

  public async generateBalanceSheet(timestamp: Date): Promise<any> {
    const report = {
      assets: 0,
      liabilities: 0,
      equity: 0,
      details: [] as any[]
    };

    const accounts = this.coa.getAllAccounts();
    for (const account of accounts) {
      if (!['ASSET', 'LIABILITY', 'EQUITY'].includes(account.type)) continue;

      const balance = this.balanceEngine.getPointInTimeBalance(account.accountId, timestamp);
      if (balance === 0) continue;

      if (account.type === 'ASSET') report.assets += balance;
      if (account.type === 'LIABILITY') report.liabilities += balance;
      if (account.type === 'EQUITY') report.equity += balance;

      report.details.push({
        accountId: account.accountId,
        type: account.type,
        balance
      });
    }

    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'FinancialReportGenerated',
      reportType: 'BALANCE_SHEET'
    } as any);

    return report;
  }

  // Similar functions for IncomeStatement, CashFlow, etc. would go here
}
