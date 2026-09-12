/**
 * FinancialApprovalEngine (Four-Eyes / Maker-Checker)
 * 
 * For high-value or first production transactions, a maker cannot
 * independently approve their own transaction. A separate checker
 * identity must approve before external settlement proceeds.
 * 
 * Integrates with MS24 GovernanceApprovalsEngine for evidence.
 */
export interface FinancialApproval {
  railTransactionId: string;
  approvalType: 'MAKER' | 'CHECKER';
  approverId: string;
  decision: 'APPROVED' | 'REJECTED';
  reason?: string;
  decidedAt: number;
}

export class FinancialApprovalEngine {
  private approvals: Map<string, FinancialApproval[]> = new Map();

  public submitApproval(approval: FinancialApproval): boolean {
    const existing = this.approvals.get(approval.railTransactionId) || [];

    // Enforce: maker and checker must be different identities
    if (approval.approvalType === 'CHECKER') {
      const maker = existing.find(a => a.approvalType === 'MAKER');
      if (maker && maker.approverId === approval.approverId) {
        console.error('[APPROVAL] Checker cannot be the same identity as Maker.');
        return false;
      }
    }

    // Prevent duplicate approval types
    if (existing.find(a => a.approvalType === approval.approvalType)) {
      console.warn(`[APPROVAL] ${approval.approvalType} already submitted for ${approval.railTransactionId}`);
      return false;
    }

    existing.push(approval);
    this.approvals.set(approval.railTransactionId, existing);
    return true;
  }

  public isFullyApproved(railTransactionId: string): boolean {
    const approvals = this.approvals.get(railTransactionId) || [];
    const maker = approvals.find(a => a.approvalType === 'MAKER' && a.decision === 'APPROVED');
    const checker = approvals.find(a => a.approvalType === 'CHECKER' && a.decision === 'APPROVED');
    return !!maker && !!checker;
  }

  public isRejected(railTransactionId: string): boolean {
    const approvals = this.approvals.get(railTransactionId) || [];
    return approvals.some(a => a.decision === 'REJECTED');
  }
}
