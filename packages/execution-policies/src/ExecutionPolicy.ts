export type ExecutionPolicyType = 'CHEAPEST' | 'FASTEST' | 'HIGHEST_RELIABILITY' | 'RETAIL' | 'ENTERPRISE' | 'VIP' | 'COMPLIANCE_FIRST' | 'INSTANT' | 'SCHEDULED' | 'DISASTER_RECOVERY';

export interface ExecutionPolicy {
  policyId: string;
  type: ExecutionPolicyType;
  description: string;
  // This will influence the ProviderRouter
  weights: {
    latency: number;
    cost: number;
    reliability: number;
  };
  retryOverrides?: {
    maxAttempts: number;
  };
}

export class ExecutionPolicyEngine {
  private policies: Map<ExecutionPolicyType, ExecutionPolicy> = new Map();

  public registerPolicy(policy: ExecutionPolicy): void {
    this.policies.set(policy.type, policy);
  }

  public getPolicy(type: ExecutionPolicyType): ExecutionPolicy | undefined {
    return this.policies.get(type);
  }
}
