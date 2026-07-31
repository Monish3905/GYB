import { ComplianceCase } from '@payment-os/case-management';
import { ComplianceDecision } from '@payment-os/decision-engine';

export interface ComplianceReport {
  reportId: string;
  reportType: 'SAR' | 'STR' | 'AML' | 'FRAUD' | 'RISK' | 'REGULATORY' | 'AUDIT' | 'OPERATIONAL';
  generatedAt: Date;
  summary: string;
  data: any;
}

export class ComplianceReporter {
  public generateReport(
    type: ComplianceReport['reportType'],
    decisions: ComplianceDecision[],
    cases: ComplianceCase[]
  ): ComplianceReport {
    const reportId = crypto.randomUUID();

    const summary = [
      `Total decisions: ${decisions.length}`,
      `Approved: ${decisions.filter(d => d.decision === 'APPROVED').length}`,
      `Rejected: ${decisions.filter(d => d.decision === 'REJECTED').length}`,
      `Manual Review: ${decisions.filter(d => d.decision === 'MANUAL_REVIEW').length}`,
      `Open Cases: ${cases.filter(c => c.status === 'OPEN').length}`
    ].join(' | ');

    return {
      reportId,
      reportType: type,
      generatedAt: new Date(),
      summary,
      data: { decisions, cases }
    };
  }

  public toJson(report: ComplianceReport): string {
    return JSON.stringify(report, null, 2);
  }

  public toCsv(report: ComplianceReport): string {
    const decisions: ComplianceDecision[] = report.data.decisions;
    const header = 'decisionId,paymentId,decision,amlScore,fraudScore,riskScore,reasonCode,timestamp';
    const rows = decisions.map(d =>
      `${d.decisionId},${d.paymentId},${d.decision},${d.amlScore},${d.fraudScore},${d.riskScore},${d.reasonCode},${d.decisionTimestamp.toISOString()}`
    );
    return [header, ...rows].join('\n');
  }
}
