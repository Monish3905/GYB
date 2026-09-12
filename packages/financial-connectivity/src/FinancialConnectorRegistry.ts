import {
  FinancialInstitutionConnector,
  ConnectorEnvironment,
  ConnectorStatus
} from './FinancialInstitutionConnector';

export class FinancialConnectorRegistry {
  private connectors: Map<string, FinancialInstitutionConnector> = new Map();

  public register(connector: FinancialInstitutionConnector): void {
    if (connector.environment === ConnectorEnvironment.PRODUCTION) {
      // Production connectors must be explicitly activated — fail closed
      if (process.env.REAL_MONEY_ENABLED !== 'true') {
        console.warn(`[REGISTRY] Refusing to register PRODUCTION connector ${connector.connectorId}: REAL_MONEY_ENABLED is false.`);
        return;
      }
    }
    this.connectors.set(connector.connectorId, connector);
    console.log(`[REGISTRY] Registered connector ${connector.connectorId} (${connector.environment})`);
  }

  public getConnector(id: string): FinancialInstitutionConnector | undefined {
    return this.connectors.get(id);
  }

  public getActiveConnectors(environment: ConnectorEnvironment): FinancialInstitutionConnector[] {
    return Array.from(this.connectors.values()).filter(
      c => c.environment === environment && c.status === ConnectorStatus.ACTIVE
    );
  }

  public deactivate(id: string): void {
    const c = this.connectors.get(id);
    if (c) {
      (c as any).status = ConnectorStatus.DEACTIVATED;
      console.log(`[REGISTRY] Deactivated connector ${id}`);
    }
  }
}
