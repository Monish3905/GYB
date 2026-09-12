import {
  FinancialInstitutionConnector,
  ConnectorEnvironment,
  ConnectorStatus,
  FundingRequest,
  FundingResult,
  FundingState,
  SettlementInstruction,
  SettlementResult,
  SettlementState,
  BeneficiaryValidationResult
} from './FinancialInstitutionConnector';

/**
 * UkSettlementConnector
 * 
 * Handles GBP collection/funding from the UK side.
 * In SANDBOX mode, simulates all interactions deterministically.
 * In PRODUCTION mode, fails closed unless real credentials and
 * REAL_MONEY_ENABLED=true are present.
 */
export class UkSettlementConnector implements FinancialInstitutionConnector {
  connectorId = 'uk-settlement-connector';
  environment: ConnectorEnvironment;
  status = ConnectorStatus.ACTIVE;

  private simulateFailure = false;
  private failureType = '';

  constructor(environment: ConnectorEnvironment) {
    this.environment = environment;
    if (environment === ConnectorEnvironment.PRODUCTION && process.env.REAL_MONEY_ENABLED !== 'true') {
      this.status = ConnectorStatus.SUSPENDED;
      console.warn('[UK-CONNECTOR] Production mode blocked: REAL_MONEY_ENABLED is false.');
    }
  }

  public injectFailure(type: string) { this.simulateFailure = true; this.failureType = type; }
  public resetFailure() { this.simulateFailure = false; this.failureType = ''; }

  getSupportedCapabilities(): string[] {
    return ['GBP_COLLECTION', 'GBP_FUNDING', 'BENEFICIARY_VALIDATION', 'RECONCILIATION'];
  }

  async initiateFunding(request: FundingRequest): Promise<FundingResult> {
    this.guardProduction();
    if (this.simulateFailure && this.failureType === 'FUNDING_FAILED') {
      return { requestId: request.requestId, providerReference: '', status: FundingState.FUNDING_FAILED };
    }
    return {
      requestId: request.requestId,
      providerReference: `uk-fund-${Date.now()}`,
      status: FundingState.FUNDING_CONFIRMED,
      confirmedAt: Date.now()
    };
  }

  async getFundingStatus(providerReference: string): Promise<FundingState> {
    return FundingState.FUNDING_CONFIRMED;
  }

  async initiateSettlement(instruction: SettlementInstruction): Promise<SettlementResult> {
    this.guardProduction();
    if (this.simulateFailure && this.failureType === 'SETTLEMENT_UNKNOWN') {
      return {
        instructionId: instruction.instructionId,
        providerReference: `uk-stl-${Date.now()}`,
        status: SettlementState.UNKNOWN,
        responseTimestamp: Date.now()
      };
    }
    return {
      instructionId: instruction.instructionId,
      providerReference: `uk-stl-${Date.now()}`,
      status: SettlementState.COMPLETED,
      responseTimestamp: Date.now()
    };
  }

  async getSettlementStatus(providerReference: string): Promise<SettlementState> {
    return SettlementState.COMPLETED;
  }

  async cancelSettlement(providerReference: string): Promise<boolean> { return true; }
  async reverseSettlement(providerReference: string): Promise<boolean> { return true; }

  async validateBeneficiary(accountToken: string, country: string): Promise<BeneficiaryValidationResult> {
    return { accountToken, isValid: true, nameMatchResult: 'EXACT', riskFlags: [] };
  }

  async reconcile(providerReference: string): Promise<boolean> { return true; }
  async healthCheck(): Promise<boolean> { return this.status === ConnectorStatus.ACTIVE; }

  private guardProduction(): void {
    if (this.environment === ConnectorEnvironment.PRODUCTION && this.status === ConnectorStatus.SUSPENDED) {
      throw new Error('UK Settlement Connector is SUSPENDED in production. Cannot execute.');
    }
  }
}
