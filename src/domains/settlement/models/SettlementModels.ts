import { Decimal } from '../../../shared/types';

export enum SettlementProviderType {
  INTERNAL_RAIL = 'internal',
  SOLANA = 'solana',
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  TRON = 'tron',
  BASE = 'base',
  ARBITRUM = 'arbitrum',
  WISE = 'wise',
  ACH = 'ach',
  SEPA = 'sepa',
  SWIFT = 'swift',
  MOCK = 'mock',
}

export interface SettlementJob {
  id: string;
  transactionId: string;
  
  providerId: string;             // 'solana', 'ethereum', 'wise', etc.
  settlementMethod: string;       // 'on_chain', 'bank_wire', 'internal', etc.
  
  // Money
  amount: Decimal;
  currency: string;
  
  // Status
  status: 'pending' | 'submitted' | 'confirmed' | 'failed' | 'cancelled';
  providerReference?: string;     // On-chain tx hash, bank ref
  
  // Fees & timing
  estimatedFee?: Decimal;
  actualFee?: Decimal;
  estimatedSettlementTime?: string;
  actualSettlementTime?: Date;
  
  // Retries
  retryCount: number;
  retryUntil?: Date;
  errorMessage?: string;
  
  // Audit
  createdAt: Date;
  submittedAt?: Date;
  completedAt?: Date;
}
