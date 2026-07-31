export interface IWalletProvider {
  /** Create a new wallet address */
  createWallet(): Promise<{ address: string, publicKey: string }>;
  
  /** Retrieve balances for all supported assets */
  getBalances(address: string): Promise<Record<string, string>>;
  
  /** Validate if an address format is correct for this chain */
  validateAddress(address: string): boolean;
}

export interface ISigner {
  /** Sign a raw payload or transaction */
  sign(payload: any): Promise<any>;
  
  /** Get the public key of this signer */
  getPublicKey(): Promise<string>;
  
  /** Sign a specific message */
  signMessage(message: string): Promise<string>;
}
