// ============================================================
// FinancialInstitutionConnector.ts
// The core interface every external financial connector must implement.
// ============================================================

export enum ConnectorEnvironment {
  SANDBOX = 'SANDBOX',
  CERTIFICATION = 'CERTIFICATION',
  PRODUCTION = 'PRODUCTION'
}

export enum ConnectorStatus {
  REGISTERED = 'REGISTERED',
  ACTIVE = 'ACTIVE',
  DEGRADED = 'DEGRADED',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED'
}

export enum FundingState {
  FUNDING_CREATED = 'FUNDING_CREATED',
  FUNDING_PENDING = 'FUNDING_PENDING',
  FUNDING_CONFIRMED = 'FUNDING_CONFIRMED',
  FUNDING_FAILED = 'FUNDING_FAILED',
  FUNDING_RETURNED = 'FUNDING_RETURNED'
}

export enum SettlementState {
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED',
  REVERSED = 'REVERSED',
  UNKNOWN = 'UNKNOWN'
}

export interface SettlementInstruction {
  instructionId: string;
  railTransactionId: string;
  amount: number;
  currency: string;
  beneficiaryAccountToken: string;
  idempotencyKey: string;
}

export interface SettlementResult {
  instructionId: string;
  providerReference: string;
  status: SettlementState;
  responseTimestamp: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface FundingRequest {
  requestId: string;
  railTransactionId: string;
  amount: number;
  currency: string;
  sourceAccountToken: string;
  idempotencyKey: string;
}

export interface FundingResult {
  requestId: string;
  providerReference: string;
  status: FundingState;
  confirmedAt?: number;
}

export interface BeneficiaryValidationResult {
  accountToken: string;
  isValid: boolean;
  nameMatchResult: 'EXACT' | 'PARTIAL' | 'MISMATCH' | 'NOT_SUPPORTED';
  riskFlags: string[];
}

export interface FinancialInstitutionConnector {
  connectorId: string;
  environment: ConnectorEnvironment;
  status: ConnectorStatus;

  // Capabilities
  getSupportedCapabilities(): string[];

  // Funding (source leg)
  initiateFunding(request: FundingRequest): Promise<FundingResult>;
  getFundingStatus(providerReference: string): Promise<FundingState>;

  // Settlement (destination leg)
  initiateSettlement(instruction: SettlementInstruction): Promise<SettlementResult>;
  getSettlementStatus(providerReference: string): Promise<SettlementState>;
  cancelSettlement(providerReference: string): Promise<boolean>;
  reverseSettlement(providerReference: string): Promise<boolean>;

  // Beneficiary
  validateBeneficiary(accountToken: string, country: string): Promise<BeneficiaryValidationResult>;

  // Reconciliation
  reconcile(providerReference: string): Promise<boolean>;

  // Health
  healthCheck(): Promise<boolean>;
}
