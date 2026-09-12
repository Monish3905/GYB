import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction, 
  createTransferInstruction,
  getAccount
} from '@solana/spl-token';
import { IChainProvider, ProviderCapabilities } from '../../interfaces/IChainProvider';
import { ISigner } from '../../interfaces/IWalletProvider';
import { getTokenConfig } from '../../../../../src/domains/blockchain/models/TokenRegistry';

export class SolanaProvider implements IChainProvider {
  private connection!: Connection;
  
  constructor(
    private rpcUrl: string = 'https://api.devnet.solana.com',
    private isMainnet: boolean = false
  ) {}

  async initialize(): Promise<void> {
    this.connection = new Connection(this.rpcUrl, 'confirmed');
  }
  
  async health(): Promise<boolean> {
    try {
      const version = await this.connection.getVersion();
      return !!version;
    } catch {
      return false;
    }
  }
  
  capabilities(): ProviderCapabilities {
    return {
      supportedAssets: ['USDC', 'USDT', 'EURC', 'SOL'],
      supportedChains: ['solana'],
      supportedBridges: ['wormhole'],
      supportedSwaps: ['jupiter'],
      settlementSpeed: '13 seconds',
      maximumTransactionSize: 'Unlimited',
      regions: ['Global'],
      feeModel: 'priority_fees',
      liquidityAvailability: 'very_high',
      batchSupport: true,
      streamingSupport: false,
      nativeTokens: ['SOL'],
      stablecoins: ['USDC', 'USDT', 'EURC']
    };
  }

  async estimateFee(payload: any): Promise<any> { 
    return "0.000005"; // 5000 lamports base fee
  }
  
  async estimateConfirmationTime(payload: any): Promise<number> { 
    return 13000; // ~13s to confirmed
  }
  
  async createWallet(params: any): Promise<any> { 
    const kp = Keypair.generate();
    return { address: kp.publicKey.toBase58(), secretKey: Buffer.from(kp.secretKey).toString('hex') };
  }
  
  async importWallet(privateKeyHex: string): Promise<any> { 
    const kp = Keypair.fromSecretKey(Buffer.from(privateKeyHex, 'hex'));
    return { address: kp.publicKey.toBase58() }; 
  }
  
  validateAddress(address: string): boolean { 
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
  
  async buildTransaction(params: { from: string, to: string, amount: number, asset?: string }): Promise<any> { 
    const tx = new Transaction();
    const fromPubkey = new PublicKey(params.from);
    const toPubkey = new PublicKey(params.to);
    
    const tokenConfig = params.asset ? getTokenConfig(params.asset, this.isMainnet) : undefined;
    
    if (tokenConfig) {
      // It's an SPL Token transfer (e.g. USDC)
      const mintPubkey = new PublicKey(tokenConfig.mintAddress);
      
      // Calculate token amount with decimals
      const rawAmount = Math.floor(params.amount * Math.pow(10, tokenConfig.decimals));
      
      // Get ATAs
      const fromAta = await getAssociatedTokenAddress(mintPubkey, fromPubkey);
      const toAta = await getAssociatedTokenAddress(mintPubkey, toPubkey);
      
      // Check if recipient ATA exists, if not, fund it
      try {
        await getAccount(this.connection, toAta);
      } catch (e: any) {
        if (e.name === 'TokenAccountNotFoundError' || e.message.includes('TokenAccountNotFoundError')) {
          // Add instruction to create ATA for recipient (funded by sender)
          tx.add(
            createAssociatedTokenAccountInstruction(
              fromPubkey, // payer
              toAta,      // ata
              toPubkey,   // owner
              mintPubkey  // mint
            )
          );
        } else {
          throw e;
        }
      }
      
      tx.add(
        createTransferInstruction(
          fromAta,
          toAta,
          fromPubkey,
          rawAmount
        )
      );
    } else {
      // It's native SOL
      const lamports = Math.floor(params.amount * 1000000000); // 1 SOL = 10^9 lamports
      tx.add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports
        })
      );
    }

    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromPubkey;
    
    return tx;
  }
  
  async signTransaction(tx: any, signer: ISigner): Promise<any> { 
    const signature = await signer.sign(tx.serializeMessage());
    tx.addSignature(new PublicKey(await signer.getPublicKey()), Buffer.from(signature, 'hex'));
    return tx;
  }
  
  async broadcastTransaction(tx: any): Promise<string> { 
    const rawTx = tx.serialize();
    return await this.connection.sendRawTransaction(rawTx); 
  }
  
  async trackTransaction(txHash: string): Promise<void> {
    await this.connection.confirmTransaction(txHash);
  }
  
  async verifyTransaction(txHash: string): Promise<boolean> { 
    const tx = await this.connection.getTransaction(txHash, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
    return tx !== null && tx.meta?.err === null; 
  }
  
  async cancelTransaction(txHash: string): Promise<boolean> { return false; } 
  
  async getBalance(address: string, asset?: string): Promise<string> { 
    const pubkey = new PublicKey(address);
    const tokenConfig = asset ? getTokenConfig(asset, this.isMainnet) : undefined;
    
    if (tokenConfig) {
      const mintPubkey = new PublicKey(tokenConfig.mintAddress);
      const ata = await getAssociatedTokenAddress(mintPubkey, pubkey);
      try {
        const balance = await this.connection.getTokenAccountBalance(ata);
        return balance.value.uiAmountString || "0";
      } catch (e: any) {
        if (e.name === 'TokenAccountNotFoundError' || e.message.includes('TokenAccountNotFoundError') || e.message.includes('could not find account')) {
          return "0";
        }
        throw e;
      }
    } else {
      const balance = await this.connection.getBalance(pubkey);
      return (balance / 1000000000).toString(); // Return in SOL, not lamports
    }
  }
  
  async reserveLiquidity(params: any): Promise<any> { return true; }
  async releaseLiquidity(params: any): Promise<any> { return true; }
  
  async transfer(params: any): Promise<string> { 
    throw new Error("Use build, sign, and broadcast directly for precise control.");
  }
  
  async rollback(params: any): Promise<boolean> { return false; } 
  
  supportsAsset(asset: string): boolean { return this.capabilities().supportedAssets.includes(asset); }
  supportsBridge(): boolean { return true; }
  supportsSwap(): boolean { return true; }
  supportsBatch(): boolean { return true; }
  supportsStreaming(): boolean { return false; }
  
  async getNetworkStatus(): Promise<any> { 
    const slot = await this.connection.getSlot();
    return { blockHeight: slot }; 
  }
}
