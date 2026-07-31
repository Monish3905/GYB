import { Decimal } from '../../../shared/types';

export enum TransactionStatus {
  PENDING = 'pending',                    // Just created
  PROVISIONAL = 'provisional',            // Ledger entries created
  ROUTING = 'routing',                    // Evaluating routes
  SETTLING = 'settling',                  // Settlement job submitted
  COMPLETED = 'completed',                // Success
  FAILED = 'failed',                      // Error
  CANCELLED = 'cancelled',                // User cancelled
}

export interface LedgerAccount {
  id: string;
  accountType: 'user_wallet' | 'pool' | 'liability' | 'equity' | 'revenue' | 'expense';
  accountName: string;
  currency: string;
  
  // References
  walletId?: string;              // If user_wallet
  poolId?: string;                // If pool
  
  parentAccountId?: string;       // For hierarchy
  isActive: boolean;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;          // Parent transaction
  
  // Debit/credit
  debitAccountId: string;
  creditAccountId: string;
  amount: Decimal;
  currency: string;
  
  // FX
  fxRate?: Decimal;               // If currencies differ
  
  // Status
  status: 'provisional' | 'committed' | 'settled';
  settlementReference?: string;   // On-chain hash, bank ref, etc.
  
  // Audit
  description: string;
  createdAt: Date;
  committedAt?: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  
  // Money
  senderWalletId: string;
  recipientWalletId: string;
  fromAmount: Decimal;
  fromCurrency: string;
  toAmount?: Decimal;
  toCurrency: string;
  fxRate?: Decimal;
  
  // Routing & settlement
  status: TransactionStatus;
  routeChosen?: string;           // 'internal_netting', 'solana_usdc', 'wise_bank', etc.
  settlementProvider?: string;    // 'internal', 'solana', 'ethereum', 'wise', 'swift'
  settlementReference?: string;
  
  // Cost
  actualCostUSD?: Decimal;
  costPercentage?: Decimal;
  
  // Compliance
  complianceApproved: boolean;
  complianceScore: number;
  complianceCheckDetails?: object;
  
  // Error handling
  errorMessage?: string;
  
  // Metadata
  metadata?: object;              // { memo, tags, custom_fields }
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
