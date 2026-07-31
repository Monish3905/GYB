import { IEventBus } from '@payment-os/event-bus';
import { EventBus } from '@payment-os/event-bus';
import { EventValidator } from '@payment-os/event-validator';
import { PostgresOutboxBroker } from '@payment-os/postgres-outbox';
import { AmlEngine } from '@payment-os/aml';
import { FraudEngine } from '@payment-os/fraud';
import { SanctionsEngine } from '@payment-os/sanctions';
import { RiskEngine } from '@payment-os/risk-engine';
import { RuleEngine } from '@payment-os/rule-engine';
import { BlockchainAnalyzer } from '@payment-os/blockchain-analytics';
import { WalletScreeningEngine } from '@payment-os/wallet-screening';
import { DecisionEngine, ComplianceDecision } from '@payment-os/decision-engine';
import { VelocityEngine } from '@payment-os/velocity-engine';

import { FraudPredictionEngine } from '@payment-os/fraud-prediction';
import { ExplainabilityEngine } from '@payment-os/explainability';
import { RecommendationEngine as AiRecommendationEngine } from '@payment-os/recommendation-engine';
import { FeatureStoreManager, OnlineFeatureStore, OfflineFeatureStore } from '@payment-os/feature-store';
import { AiDecisionService } from '@payment-os/ai-decision';

export class ComplianceGateway {
  private decisionEngine: DecisionEngine;
  private bus: IEventBus;

  constructor() {
    const broker = new PostgresOutboxBroker();
    const validator = new EventValidator();
    this.bus = new EventBus(broker, validator);

    const velocity = new VelocityEngine();
    const aml = new AmlEngine(this.bus, velocity);
    const fraud = new FraudEngine();
    const sanctions = new SanctionsEngine();
    const risk = new RiskEngine();
    const rules = new RuleEngine();
    const analyzer = new BlockchainAnalyzer();
    const walletScreening = new WalletScreeningEngine(analyzer);

    // AI Dependencies
    const mockOnlineStore: OnlineFeatureStore = {
      getFeatures: async () => ({}),
      setFeatures: async () => {}
    };
    const mockOfflineStore: OfflineFeatureStore = {
      getHistoricalFeatures: async () => []
    };
    const featureStore = new FeatureStoreManager(mockOnlineStore, mockOfflineStore);
    const fraudModel = new FraudPredictionEngine();
    const explainability = new ExplainabilityEngine();
    const aiRecommendation = new AiRecommendationEngine();

    const aiService = new AiDecisionService(this.bus, featureStore, fraudModel, explainability, aiRecommendation);

    this.decisionEngine = new DecisionEngine(
      this.bus, aml, fraud, sanctions, risk, rules, walletScreening, aiService
    );
  }

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
    return this.decisionEngine.evaluate(request);
  }
}

// Internal REST API route definitions (wired to ComplianceGateway)
export const ComplianceApiRoutes = {
  'POST /identity/verify': 'IdentityManager.verify',
  'POST /kyc/start': 'KycEngine.evaluateKyc',
  'POST /kyb/start': 'KybEngine.evaluateKyb',
  'POST /aml/check': 'AmlEngine.evaluate',
  'POST /fraud/check': 'FraudEngine.evaluate',
  'POST /risk/evaluate': 'RiskEngine.calculateRisk',
  'POST /wallet/screen': 'WalletScreeningEngine.screenWallet',
  'POST /travel-rule/generate': 'TravelRuleEngine.generatePayload',
  'POST /compliance/evaluate': 'ComplianceGateway.evaluate',
  'GET /compliance/cases': 'CaseManager.getAllCases',
  'GET /risk/:id': 'RiskEngine.getScore',
  'GET /identity/:id': 'IdentityManager.getIdentity',
};
