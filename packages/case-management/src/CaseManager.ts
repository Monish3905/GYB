import { IEventBus } from '@payment-os/event-bus';

export type CasePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type CaseStatus = 'OPEN' | 'ASSIGNED' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

export interface ComplianceCase {
  caseId: string;
  priority: CasePriority;
  status: CaseStatus;
  paymentId: string;
  correlationId: string;
  triggeredRules: string[];
  evidence: string[];
  riskScore: number;
  amlScore: number;
  fraudScore: number;
  timeline: CaseTimelineEntry[];
  investigatorNotes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseTimelineEntry {
  timestamp: Date;
  actor: string;
  action: string;
  details: string;
}

export class CaseManager {
  private cases: Map<string, ComplianceCase> = new Map();

  constructor(private bus: IEventBus) {}

  public async createCase(
    paymentId: string,
    correlationId: string,
    priority: CasePriority,
    triggeredRules: string[],
    evidence: string[],
    riskScore: number,
    amlScore: number,
    fraudScore: number
  ): Promise<ComplianceCase> {
    const caseId = crypto.randomUUID();
    const now = new Date();

    const complianceCase: ComplianceCase = {
      caseId,
      priority,
      status: 'OPEN',
      paymentId,
      correlationId,
      triggeredRules,
      evidence,
      riskScore,
      amlScore,
      fraudScore,
      timeline: [{
        timestamp: now,
        actor: 'system',
        action: 'CASE_CREATED',
        details: `Case created automatically. Priority: ${priority}. Risk: ${riskScore}`
      }],
      investigatorNotes: [],
      createdAt: now,
      updatedAt: now
    };

    this.cases.set(caseId, complianceCase);

    await this.bus.publish('payment.domain.compliance.casecreated', {
      eventId: crypto.randomUUID(),
      correlationId,
      traceId: crypto.randomUUID(),
      aggregateId: caseId,
      aggregateType: 'ComplianceCase',
      eventType: 'CaseCreated',
      version: 'v1',
      occurredAt: now,
      producer: 'CaseManager',
      payload: { caseId, paymentId, priority },
      headers: {}
    });

    return complianceCase;
  }

  public getCase(caseId: string): ComplianceCase | undefined {
    return this.cases.get(caseId);
  }

  public updateStatus(caseId: string, status: CaseStatus, actor: string, notes: string): void {
    const c = this.cases.get(caseId);
    if (!c) throw new Error(`Case ${caseId} not found`);
    c.status = status;
    c.updatedAt = new Date();
    c.timeline.push({ timestamp: new Date(), actor, action: `STATUS_UPDATED_${status}`, details: notes });
    if (notes) c.investigatorNotes.push(notes);
  }

  public getAllCases(): ComplianceCase[] {
    return Array.from(this.cases.values());
  }
}
