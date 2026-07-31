import { IWalletProvider } from '../interfaces/IWalletProvider';

export class WalletManager {
  private providers: Map<string, IWalletProvider> = new Map();

  /** Register a wallet provider for a specific chain */
  registerProvider(chainName: string, provider: IWalletProvider): void {
    this.providers.set(chainName, provider);
  }

  /** Create a wallet on a specific chain */
  async createWallet(chainName: string): Promise<{ address: string, publicKey: string }> {
    const provider = this.providers.get(chainName);
    if (!provider) {
      throw new Error(`No wallet provider registered for chain: ${chainName}`);
    }
    return provider.createWallet();
  }

  /** Validate address for a specific chain */
  validateAddress(chainName: string, address: string): boolean {
    const provider = this.providers.get(chainName);
    if (!provider) {
      throw new Error(`No wallet provider registered for chain: ${chainName}`);
    }
    return provider.validateAddress(address);
  }

  /** Get balances across all supported chains for an address */
  async getBalances(chainName: string, address: string): Promise<Record<string, string>> {
    const provider = this.providers.get(chainName);
    if (!provider) {
      throw new Error(`No wallet provider registered for chain: ${chainName}`);
    }
    return provider.getBalances(address);
  }
}
