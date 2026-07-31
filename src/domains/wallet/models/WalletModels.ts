import { Decimal } from '../../../shared/types';

export interface Wallet {
  id: string;
  userId: string;
  currency: string;              // USD, INR, AED, PHP, etc.
  
  // Balances
  balanceAvailable: Decimal;
  balancePending: Decimal;
  balanceReserved: Decimal;
  balanceLocked: Decimal;
  balanceSettlement: Decimal;
  balanceEscrow: Decimal;
  
  // Configuration
  walletType: 'fiat' | 'crypto' | 'stablecoin';
  blockchainAddress?: string;    // For crypto wallets
  bankAccountId?: string;         // For fiat wallets
  
  // Status
  isActive: boolean;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

export interface Balance {
  walletId: string;
  balanceAvailable: Decimal;
  balancePending: Decimal;
  balanceReserved: Decimal;
  balanceLocked: Decimal;
  balanceSettlement: Decimal;
  balanceEscrow: Decimal;
  balanceTotal: Decimal;
  lastUpdatedAt: Date;
}

export interface Hold {
  id: string;
  walletId: string;
  transactionId: string;
  amount: Decimal;
  reason: string;
  createdAt: Date;
  releasedAt?: Date;
}
