import { Decimal } from '../../../shared/types';

export interface Route {
  name: string;
  provider: string;
  totalCost: Decimal;
  costPercentage: Decimal;        // Percentage of transfer amount
  recipientAmount: Decimal;       // Amount recipient receives
  
  // Breakdown
  fees: {
    fxSpread: Decimal;
    gas: Decimal;
    bridgeFee: Decimal;
    bankFee: Decimal;
    complianceFee: Decimal;
    settlement: Decimal;
  };
  
  // Timing
  settlementTime: string;         // 'instant', '13 seconds', '1 business day'
  
  // Confidence
  confidence: 'low' | 'medium' | 'high' | 'very_high';
  
  // Constraints
  minAmount?: Decimal;
  maxAmount?: Decimal;
  availableUntil?: Date;
}

export interface CostBreakdown {
  fromCurrency: string;
  toCurrency: string;
  amount: Decimal;
  fxRate: Decimal;
  fxSpread: Decimal;
  gasFee: Decimal;
  bridgeFee: Decimal;
  bankFee: Decimal;
  complianceFee: Decimal;
  liquidityCost: Decimal;
  totalCost: Decimal;
  totalPercentage: Decimal;
}
