import { SettlementPolicy, PolicyContext, PolicyType } from './SettlementPolicy';

export class PolicyEngine {
  private policies: Map<PolicyType, SettlementPolicy> = new Map();
  private corridorPolicies: Map<string, PolicyType[]> = new Map();

  public registerPolicy(policy: SettlementPolicy): void {
    this.policies.set(policy.type, policy);
  }

  public assignPoliciesToCorridor(corridor: string, policyTypes: PolicyType[]): void {
    this.corridorPolicies.set(corridor, policyTypes);
  }

  public evaluate(context: PolicyContext): PolicyContext {
    const activePolicyTypes = this.corridorPolicies.get(context.corridor) || [];

    // Clone context to avoid mutating the input directly
    const evaluationContext = { ...context };

    for (const type of activePolicyTypes) {
      const policy = this.policies.get(type);
      if (policy) {
        for (const rule of policy.rules) {
          if (rule.condition(evaluationContext)) {
            rule.action(evaluationContext);
          }
        }
      }
    }

    return evaluationContext;
  }
}

// Example Factory for predefined policies
export class PolicyFactory {
  static createLowCostPolicy(): SettlementPolicy {
    return {
      policyId: 'low-cost-v1',
      type: 'LOW_COST',
      description: 'Prioritizes the lowest cost settlement method.',
      rules: [
        {
          ruleId: 'prefer-blockchain-if-cheap',
          condition: (ctx: PolicyContext) => ctx.availableMethods.includes('BLOCKCHAIN'),
          action: (ctx: PolicyContext) => {
            ctx.selectedMethod = 'BLOCKCHAIN';
            ctx.priorityLevel = 'LOW';
          }
        }
      ]
    };
  }

  static createInstantPolicy(): SettlementPolicy {
    return {
      policyId: 'instant-v1',
      type: 'INSTANT',
      description: 'Prioritizes immediate settlement over cost.',
      rules: [
        {
          ruleId: 'prefer-rtp-or-blockchain',
          condition: (ctx: PolicyContext) => ctx.availableMethods.includes('RTP') || ctx.availableMethods.includes('BLOCKCHAIN'),
          action: (ctx: PolicyContext) => {
            if (ctx.availableMethods.includes('RTP')) {
              ctx.selectedMethod = 'RTP';
            } else {
              ctx.selectedMethod = 'BLOCKCHAIN';
            }
            ctx.priorityLevel = 'CRITICAL';
          }
        }
      ]
    };
  }
}
