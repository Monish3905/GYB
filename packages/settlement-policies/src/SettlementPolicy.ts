export type PolicyType = 'RETAIL' | 'ENTERPRISE' | 'VIP' | 'EMERGENCY' | 'COMPLIANCE_FIRST' | 'BLOCKCHAIN_PREFERRED' | 'BANK_PREFERRED' | 'LOW_COST' | 'INSTANT';

export interface SettlementPolicy {
  policyId: string;
  type: PolicyType;
  description: string;
  rules: PolicyRule[];
}

export interface PolicyRule {
  ruleId: string;
  condition: (context: PolicyContext) => boolean;
  action: (context: PolicyContext) => void;
}

export interface PolicyContext {
  corridor: string;
  amount: number;
  currency: string;
  customerType: string;
  preferredMethod?: string;
  availableMethods: string[];
  selectedMethod?: string;
  priorityLevel: string;
}
