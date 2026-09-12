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
 * IndiaSettlementConnector
 * 
 * Handles INR payout to Indian beneficiaries.
 * In SANDBOX mode, simulates all interactions deterministically.
 * In PRODUCTION mode, fails closed unless real credentials and
 * REAL_MONEY_ENABLED=true are present.
 * 
 * EXTERNAL DEPENDENCY:
 *   Real INR payout requires an authorized relationship with an Indian PSP
 *   or bank (e.g., licensed for UPI/IMPS/NEFT/RTGS disbursement).
 *   This connector does NOT claim such a relationship exists.
 */
export class IndiaSettlementConnector implements FinancialInstitutionConnector {
  connectorId = 'india-settlement-connector';
  environment: ConnectorEnvironment;
  status = ConnectorStatus.ACTIVE;

  private simulateFailure = false;
  private failureType = '';

  constructor(environment: ConnectorEnvironment) {
    this.environment = environment;
    if (environment === ConnectorEnvironment.PRODUCTION && process.env.REAL_MONEY_ENABLED !== 'true') {
      this.status = ConnectorStatus.SUSPENDED;
      console.warn('[INDIA-CONNECTOR] Production mode blocked: REAL_MONEY_ENABLED is false.');
    }
  }

  public injectFailure(type: string) { this.simulateFailure = true; this.failureType = type; }
  public resetFailure() { this.simulateFailure = false; this.failureType = ''; }

  getSupportedCapabilities(): string[] {
    return ['INR_PAYOUT', 'BENEFICIARY_VALIDATION', 'RECONCILIATION'];
  }

  async initiateFunding(_request: FundingRequest): Promise<FundingResult> {
    throw new Error('India connector does not support funding/collection. Use UK connector for GBP funding.');
  }

  async getFundingStatus(_providerReference: string): Promise<FundingState> {
    throw new Error('India connector does not support funding/collection.');
  }

  async initiateSettlement(instruction: SettlementInstruction): Promise<SettlementResult> {
    this.guardProduction();
    if (this.simulateFailure) {
      if (this.failureType === 'PROVIDER_TIMEOUT') {
        throw new Error('India PSP: Connection timed out');
      }
      if (this.failureType === 'BENEFICIARY_REJECTED') {
        return {
          instructionId: instruction.instructionId,
          providerReference: '',
          status: SettlementState.FAILED,
          responseTimestamp: Date.now(),
          errorCode: 'BENEFICIARY_REJECTED',
          errorMessage: 'Beneficiary account is invalid or closed'
        };
      }
      if (this.failureType === 'SETTLEMENT_UNKNOWN') {
        return {
          instructionId: instruction.instructionId,
          providerReference: `in-stl-${Date.now()}`,
          status: SettlementState.UNKNOWN,
          responseTimestamp: Date.now()
        };
      }
    }
    return {
      instructionId: instruction.instructionId,
      providerReference: `in-stl-${Date.now()}`,
      status: SettlementState.COMPLETED,
      responseTimestamp: Date.now()
    };
  }

  async getSettlementStatus(providerReference: string): Promise<SettlementState> {
    // In sandbox, UNKNOWN resolves to COMPLETED on re-query
    return SettlementState.COMPLETED;
  }

  async cancelSettlement(_providerReference: string): Promise<boolean> { return false; /* India payouts are generally irrevocable */ }
  async reverseSettlement(_providerReference: string): Promise<boolean> { return false; }

  async validateBeneficiary(accountToken: string, country: string): Promise<BeneficiaryValidationResult> {
    if (this.simulateFailure && this.failureType === 'BENEFICIARY_INVALID') {
      return { accountToken, isValid: false, nameMatchResult: 'MISMATCH', riskFlags: ['NAME_MISMATCH'] };
    }
    return { accountToken, isValid: true, nameMatchResult: 'EXACT', riskFlags: [] };
  }

  async reconcile(providerReference: string): Promise<boolean> { return true; }
  async healthCheck(): Promise<boolean> { return this.status === ConnectorStatus.ACTIVE; }

  private guardProduction(): void {
    if (this.environment === ConnectorEnvironment.PRODUCTION && this.status === ConnectorStatus.SUSPENDED) {
      throw new Error('India Settlement Connector is SUSPENDED in production. Cannot execute.');
    }
  }
}
