import { FinancialInstitutionConnector, ConnectorStatus } from './FinancialInstitutionConnector';

export interface ConnectorHealthSnapshot {
  connectorId: string;
  isAvailable: boolean;
  latencyMs: number;
  errorRate: number;
  settlementSuccessRate: number;
  unknownSettlementCount: number;
  checkedAt: number;
}

export class ConnectorHealthMonitor {
  private healthHistory: Map<string, ConnectorHealthSnapshot[]> = new Map();

  public async checkHealth(connector: FinancialInstitutionConnector): Promise<ConnectorHealthSnapshot> {
    const start = Date.now();
    let isAvailable = false;
    try {
      isAvailable = await connector.healthCheck();
    } catch {
      isAvailable = false;
    }
    const latencyMs = Date.now() - start;

    const snapshot: ConnectorHealthSnapshot = {
      connectorId: connector.connectorId,
      isAvailable,
      latencyMs,
      errorRate: isAvailable ? 0 : 100,
      settlementSuccessRate: isAvailable ? 100 : 0,
      unknownSettlementCount: 0,
      checkedAt: Date.now()
    };

    const history = this.healthHistory.get(connector.connectorId) || [];
    history.push(snapshot);
    if (history.length > 100) history.shift(); // Keep last 100 checks
    this.healthHistory.set(connector.connectorId, history);

    // Auto-degrade if consistently unhealthy
    if (!isAvailable) {
      const recentChecks = history.slice(-5);
      const allFailed = recentChecks.every(h => !h.isAvailable);
      if (allFailed && recentChecks.length >= 5) {
        (connector as any).status = ConnectorStatus.DEGRADED;
        console.warn(`[HEALTH] Connector ${connector.connectorId} auto-degraded after 5 consecutive failures.`);
      }
    }

    return snapshot;
  }

  public getHistory(connectorId: string): ConnectorHealthSnapshot[] {
    return this.healthHistory.get(connectorId) || [];
  }
}
