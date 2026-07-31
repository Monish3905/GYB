export interface RegulatoryPolicy { policyId: string; jurisdiction: string; policy: string; enforcedSince: Date; }
export class RegulatoryPolicyEngine {
  private policies: RegulatoryPolicy[] = [];
  public addPolicy(p: RegulatoryPolicy): void { this.policies.push(p); }
  public getPoliciesFor(jurisdiction: string): RegulatoryPolicy[] { return this.policies.filter(p => p.jurisdiction === jurisdiction); }
}
