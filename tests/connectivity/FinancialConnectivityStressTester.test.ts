import { ConnectorEnvironment, SettlementState } from '../../packages/financial-connectivity/src/FinancialInstitutionConnector';
import { IndiaSettlementConnector } from '../../packages/financial-connectivity/src/IndiaSettlementConnector';
import { ConnectorHealthMonitor } from '../../packages/connector-health/src/ConnectorHealthMonitor';

describe('Financial Connectivity Load & Reliability Tester', () => {
  it('should process 1,000 concurrent settlement submissions reliably', async () => {
    const connector = new IndiaSettlementConnector(ConnectorEnvironment.SANDBOX);
    
    const executions: Promise<any>[] = [];
    
    for (let i = 0; i < 1000; i++) {
      executions.push(connector.initiateSettlement({
        instructionId: `inst-load-${i}`,
        railTransactionId: `tx-load-${i}`,
        amount: 100,
        currency: 'INR',
        beneficiaryAccountToken: `tok-${i}`,
        idempotencyKey: `idem-${i}`
      }));
    }

    const results = await Promise.all(executions);
    
    const successes = results.filter(r => r.status === SettlementState.COMPLETED).length;
    expect(successes).toBe(1000);
  });

  it('should auto-degrade connector upon consecutive health failures', async () => {
    const connector = new IndiaSettlementConnector(ConnectorEnvironment.SANDBOX);
    const monitor = new ConnectorHealthMonitor();

    // Inject persistent failure
    connector.injectFailure('PROVIDER_TIMEOUT'); // this simulates health failure due to latency/exception

    for (let i = 0; i < 5; i++) {
      // Mock health check failing
      jest.spyOn(connector, 'healthCheck').mockResolvedValueOnce(false);
      await monitor.checkHealth(connector);
    }

    // After 5 failures, the monitor should set status to DEGRADED
    expect(connector.status).toBe('DEGRADED');
  });
});
