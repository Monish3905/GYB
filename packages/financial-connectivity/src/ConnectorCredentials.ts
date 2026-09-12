import { ConnectorEnvironment } from './FinancialInstitutionConnector';

export interface ConnectorCredential {
  connectorId: string;
  environment: ConnectorEnvironment;
  credentialType: 'API_KEY' | 'OAUTH_CLIENT' | 'CERTIFICATE' | 'HMAC';
  vaultReference: string; // NEVER the actual secret
  version: number;
  expiresAt: number | null;
  isActive: boolean;
}

export class ConnectorCredentialsManager {
  private credentials: Map<string, ConnectorCredential> = new Map();

  public store(credential: ConnectorCredential): void {
    if (!credential.vaultReference || credential.vaultReference.length < 5) {
      throw new Error('Credential must reference a vault entry. Raw secrets must never be stored.');
    }
    const key = `${credential.connectorId}-${credential.environment}-${credential.credentialType}`;
    this.credentials.set(key, credential);
    console.log(`[CREDENTIALS] Stored vault reference for ${credential.connectorId} (${credential.environment}/${credential.credentialType} v${credential.version})`);
  }

  public getActiveCredential(connectorId: string, environment: ConnectorEnvironment, type: string): ConnectorCredential | undefined {
    const key = `${connectorId}-${environment}-${type}`;
    const cred = this.credentials.get(key);
    if (!cred || !cred.isActive) return undefined;
    if (cred.expiresAt && cred.expiresAt < Date.now()) {
      console.warn(`[CREDENTIALS] Credential for ${connectorId} has expired.`);
      return undefined;
    }
    return cred;
  }

  public rotate(connectorId: string, environment: ConnectorEnvironment, type: string, newVaultRef: string): void {
    const key = `${connectorId}-${environment}-${type}`;
    const existing = this.credentials.get(key);
    if (existing) {
      existing.isActive = false;
    }
    this.store({
      connectorId,
      environment,
      credentialType: type as any,
      vaultReference: newVaultRef,
      version: existing ? existing.version + 1 : 1,
      expiresAt: null,
      isActive: true
    });
    console.log(`[CREDENTIALS] Rotated credential for ${connectorId}`);
  }
}
