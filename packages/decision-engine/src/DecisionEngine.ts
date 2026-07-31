import { IEventBus } from '@payment-os/event-bus';
import { AmlEngine } from '@payment-os/aml';
import { FraudEngine } from '@payment-os/fraud';
import { SanctionsEngine } from '@payment-os/sanctions';
import { RiskEngine } from '@payment-os/risk-engine';
import { RuleEngine } from '@payment-os/rule-engine';
import { WalletScreeningEngine } from '@payment-os/wallet-screening';

export type DecisionType = 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';

export interface ComplianceDecision {
  decisionId: string;
  paymentId: string;
  decision: DecisionType;
  amlScore: number;
  fraudScore: number;
  riskScore: number;
  sanctionsResult: string;
  triggeredRules: string[];
  evidence: string[];
  reasonCode: string;
  executionTrace: string[];
  decisionTimestamp: Date;
  correlationId: string;
}

export interface IAiDecisionService {
  evaluateAiContext(
    paymentId: string,
    customerId: string,
    ruleRiskScore: number,
    correlationId: string
  ): Promise<{
    adaptiveRiskScore: number;
    fraudProbability: number;
    explanation: { reasoning: string };
    recommendation: string;
  }>;
}

export class DecisionEngine {
  constructor(
    private bus: IEventBus,
    private aml: AmlEngine,
    private fraud: FraudEngine,
    private sanctions: SanctionsEngine,
    private risk: RiskEngine,
    private ruleEngine: RuleEngine,
    private walletScreening: WalletScreeningEngine,
    private aiService?: IAiDecisionService
  ) {}

  public async evaluate(request: {
    paymentId: string;
    customerId: string;
    amount: number;
    currency: string;
    senderCountry: string;
    receiverCountry: string;
    senderName: string;
    walletAddress?: string;
    deviceIp: string;
    correlationId: string;
  }): Promise<ComplianceDecision> {

    const trace: string[] = [];
    const evidence: string[] = [];
    const triggeredRules: string[] = [];

    trace.push('Decision Engine started');

    // AML Check
    trace.push('Running AML...');
    const amlAlert = await this.aml.evaluate(
      request.paymentId, request.customerId, request.amount, request.correlationId
    );
    const amlScore = amlAlert?.riskScore ?? 0;
    if (amlAlert) {
      evidence.push(...amlAlert.evidence);
      triggeredRules.push(...amlAlert.triggeredRules);
    }
    trace.push(`AML score: ${amlScore}`);

    // Fraud Check
    trace.push('Running Fraud detection...');
    const fraudResult = await this.fraud.evaluate(request.deviceIp, request.amount, request.senderCountry);
    let fraudScore = fraudResult.riskScore;
    evidence.push(...fraudResult.evidence);
    trace.push(`Fraud score: ${fraudScore}`);

    // Sanctions Check
    trace.push('Running Sanctions screening...');
    const sanctionsResult = await this.sanctions.evaluate(request.senderName, request.senderCountry);
    if (sanctionsResult.status === 'BLOCK' || sanctionsResult.status === 'MATCH') {
      triggeredRules.push('SANCTIONS_MATCHED');
      evidence.push(`Sanctions match: ${sanctionsResult.matchedEntity ?? 'Unknown'}`);
    }
    trace.push(`Sanctions: ${sanctionsResult.status}`);

    // Wallet Screening (if blockchain address present)
    let walletScore = 0;
    if (request.walletAddress) {
      trace.push('Running Wallet screening...');
      const walletResult = await this.walletScreening.screenWallet(request.walletAddress, 'SOLANA');
      walletScore = walletResult.riskScore;
      if (!walletResult.passed) {
        triggeredRules.push('WALLET_HIGH_RISK');
        evidence.push(...walletResult.flags);
      }
      trace.push(`Wallet score: ${walletScore}`);
    }

    // Composite Risk Score (Deterministic Rule Base)
    trace.push('Calculating deterministic composite risk...');
    const riskEval = await this.risk.calculateRisk(
      50,       // customerRisk - from customer profile
      walletScore,
      20,       // providerRisk - from provider profile
      30,       // corridorRisk - from country corridor model
      fraudScore,
      amlScore
    );
    let finalRiskScore = riskEval.compositeScore;
    let riskDecision = riskEval.decision;
    trace.push(`Deterministic Risk: ${finalRiskScore} / ${riskEval.riskLevel}`);

    // Call AI Service (Non-breaking Fallback)
    if (this.aiService) {
      try {
        trace.push('Invoking AI Intelligence Layer...');
        const aiResult = await this.aiService.evaluateAiContext(
          request.paymentId,
          request.customerId,
          finalRiskScore,
          request.correlationId
        );
        trace.push(`AI Adaptive Risk: ${aiResult.adaptiveRiskScore}`);
        trace.push(`AI Recommendation: ${aiResult.recommendation}`);
        evidence.push(`AI Explanation: ${aiResult.explanation.reasoning}`);
        
        finalRiskScore = aiResult.adaptiveRiskScore;
        fraudScore = Math.max(fraudScore, Math.round(aiResult.fraudProbability * 100));
        
        if (aiResult.recommendation === 'REJECT' || aiResult.recommendation === 'FREEZE_WALLET') {
            riskDecision = 'REJECT';
        } else if (aiResult.recommendation === 'MANUAL_REVIEW' || aiResult.recommendation === 'ENHANCED_DUE_DILIGENCE') {
            riskDecision = 'MANUAL_REVIEW';
        }

      } catch (err) {
        trace.push(`AI Layer failed/timeout, falling back to deterministic rules. Error: ${err}`);
      }
    }

    // Rule Engine evaluation
    const ruleContext = {
      amount: request.amount,
      senderCountry: request.senderCountry,
      receiverCountry: request.receiverCountry,
      currency: request.currency,
      amlScore,
      fraudScore,
      riskScore: finalRiskScore
    };
    const { triggered } = this.ruleEngine.evaluateContext(ruleContext);
    triggeredRules.push(...triggered.map(r => r.name));

    // Final decision determination
    let decision: DecisionType = 'APPROVED';
    let reasonCode = 'COMPLIANCE_PASSED';

    if (sanctionsResult.status === 'BLOCK' || sanctionsResult.status === 'MATCH') {
      decision = 'REJECTED';
      reasonCode = 'SANCTIONS_MATCH';
    } else if (riskDecision === 'REJECT' || amlScore >= 80 || fraudResult.decision === 'REJECT') {
      decision = 'REJECTED';
      reasonCode = 'HIGH_RISK_SCORE';
    } else if (riskDecision === 'MANUAL_REVIEW' || fraudResult.decision === 'REVIEW' || triggered.some(r => r.action === 'REVIEW')) {
      decision = 'MANUAL_REVIEW';
      reasonCode = 'ELEVATED_RISK_MANUAL_REVIEW';
    }

    trace.push(`Final decision: ${decision}`);

    const complianceDecision: ComplianceDecision = {
      decisionId: crypto.randomUUID(),
      paymentId: request.paymentId,
      decision,
      amlScore,
      fraudScore,
      riskScore: riskEval.compositeScore,
      sanctionsResult: sanctionsResult.status,
      triggeredRules,
      evidence,
      reasonCode,
      executionTrace: trace,
      decisionTimestamp: new Date(),
      correlationId: request.correlationId
    };

    const eventType = decision === 'APPROVED'
      ? 'ComplianceApproved'
      : decision === 'REJECTED'
      ? 'ComplianceRejected'
      : 'ComplianceManualReview';

    await this.bus.publish(`payment.domain.compliance.${eventType.toLowerCase()}`, {
      eventId: crypto.randomUUID(),
      correlationId: request.correlationId,
      traceId: crypto.randomUUID(),
      aggregateId: request.paymentId,
      aggregateType: 'Payment',
      eventType,
      version: 'v1',
      occurredAt: new Date(),
      producer: 'DecisionEngine',
      payload: complianceDecision,
      headers: {}
    });

    return complianceDecision;
  }
}
