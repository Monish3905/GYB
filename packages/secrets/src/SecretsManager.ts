export interface ISecretsProvider {
  getSecret(path: string): Promise<string>;
  setSecret(path: string, value: string): Promise<void>;
  rotateSecret(path: string): Promise<void>;
}

export class SecretsManager {
  private provider: ISecretsProvider;

  constructor(provider: ISecretsProvider) {
    this.provider = provider;
  }

  public async retrieve(tenantId: string, secretName: string): Promise<string> {
    const path = `/${tenantId}/${secretName}`;
    return this.provider.getSecret(path);
  }

  public async store(tenantId: string, secretName: string, value: string): Promise<void> {
    const path = `/${tenantId}/${secretName}`;
    return this.provider.setSecret(path, value);
  }
}
