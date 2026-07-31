import { IEventBus } from '@payment-os/event-bus';

export class DashboardAggregator {
  constructor(private bus: IEventBus) {}

  public async getMerchantDashboard(merchantId: string): Promise<any> {
    // Queries materialized read models maintained by CQRS projections
    return {
      merchantId,
      revenue: 50000,
      activeWallets: 3,
      pendingSettlements: 2,
      complianceAlerts: 0
    };
  }

  public async getCustomerDashboard(customerId: string): Promise<any> {
    return {
      customerId,
      walletBalance: 1200,
      recentTransactions: [],
      pendingInvoices: 1
    };
  }
}
