import { SettlementInstruction } from '@payment-os/settlement-instructions';

export type OptimizationObjective = 
  | 'MINIMUM_COST' 
  | 'MINIMUM_GAS' 
  | 'MINIMUM_LIQUIDITY_USAGE' 
  | 'MINIMUM_TREASURY_USAGE' 
  | 'FASTEST' 
  | 'HIGHEST_SUCCESS_RATE' 
  | 'BALANCED' 
  | 'MAXIMUM_PROFIT' 
  | 'AI_OPTIMIZER';

export interface SettlementPlan {
  planId: string;
  instructions: SettlementInstruction[];
  totalCostEstimated: number;
  expectedDurationMs: number;
  createdAt: Date;
}

export interface OptimizationStrategy {
  objective: OptimizationObjective;
  optimize(context: PlanningContext): SettlementPlan;
}

export interface PlanningContext {
  netObligations: any[]; // These would be typed in a full system
  treasuryStatus: any;
  liquidity: any;
  providerHealth: any;
  routing: any;
}
