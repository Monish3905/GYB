import { Decimal } from '../../../shared/types';

export interface Chain {
  name: string;                   // 'solana', 'ethereum', 'polygon'
  chainId: number | string;
  isEnabled: boolean;
  rpcEndpoint: string;
  
  // Configuration
  minGasPrice: Decimal;
  avgGasPrice: Decimal;
  
  // Stablecoins available
  stablecoins: {
    symbol: string;               // 'USDC', 'USDT'
    tokenAddress: string;
    decimals: number;
    issuer: string;
  }[];
}

export interface BlockchainAccount {
  id: string;
  userId: string;
  chain: string;
  publicAddress: string;
  isHot: boolean;                 // Hot vs cold wallet
  
  // Keys (encrypted)
  privateKeyEncrypted?: string;
  multisigThreshold?: number;
  multisigSigners?: string[];
  
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface OnChainTransaction {
  id: string;
  paymentTransactionId: string;
  
  chain: string;
  txHash: string;
  
  // Money
  amount: Decimal;
  tokenAddress: string;
  token: string;
  
  // Addresses
  from: string;
  to: string;
  
  // Status
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  blockHeight?: number;
  
  // Fees
  gasFeeUSD?: Decimal;
  
  // Audit
  createdAt: Date;
  confirmedAt?: Date;
}
