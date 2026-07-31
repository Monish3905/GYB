import { Decimal } from '../../../shared/types';

export interface CountryPool {
  id: string;
  countryCode: string;            // IN, US, AE, PH
  currency: string;               // INR, USD, AED, PHP
  
  // Balance
  balance: Decimal;
  targetBalance: Decimal;
  minThreshold: Decimal;
  maxThreshold: Decimal;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;

  // Flows (24h)
  totalInflow24h: Decimal;
  totalOutflow24h: Decimal;
  
  // Status
  poolStatus: 'active' | 'paused' | 'rebalancing';
  lastSettlementTime: Date;
}

export interface NettingCycle {
  id: string;
  cycleStart: Date;
  cycleEnd: Date;
  
  // Flows
  fromCurrency: string;
  toCurrency: string;
  totalInflow: Decimal;
  totalOutflow: Decimal;
  netSettlementAmount: Decimal;   // What's actually settled
  
  // Settlement
  settlementMethod: string;        // 'solana', 'wise', 'swift', etc.
  settlementStatus: 'pending' | 'in_progress' | 'settled' | 'failed';
  settlementReference?: string;
  actualCost?: Decimal;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
