import { ISigner } from '../interfaces/IWalletProvider';

export class LocalSigner implements ISigner {
  constructor(private privateKey: string, private publicKey: string) {}

  async sign(payload: any): Promise<any> {
    console.warn("[LocalSigner] Signing payload locally. NEVER use in production!");
    // In a real implementation this would use the crypto library to sign
    return {
      payload,
      signature: "mock_local_signature"
    };
  }

  async getPublicKey(): Promise<string> {
    return this.publicKey;
  }

  async signMessage(message: string): Promise<string> {
    console.warn("[LocalSigner] Signing message locally. NEVER use in production!");
    return "mock_local_message_signature";
  }
}
