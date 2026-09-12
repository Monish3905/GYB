import axios from 'axios';
import { createHmac } from 'crypto';
import { FinancialInstitutionConnector, ConnectorEnvironment, ConnectorStatus, FundingRequest, FundingResult, FundingState, SettlementInstruction, SettlementResult, SettlementState, BeneficiaryValidationResult } from '../../financial-connectivity/src/FinancialInstitutionConnector';

/**
 * Modulr Funding Connector (UK GBP Collection)
 * Implements the Modulr API for receiving GBP via Faster Payments/Direct Debit.
 */
export class ModulrFundingConnector implements FinancialInstitutionConnector {
  connectorId = 'modulr-gbp-connector';
  environment: ConnectorEnvironment;
  status = ConnectorStatus.ACTIVE;

  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor(apiKey: string, apiSecret: string, environment: ConnectorEnvironment) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.environment = environment;
    this.baseUrl = environment === ConnectorEnvironment.PRODUCTION 
      ? 'https://api.modulrfinance.com/api' 
      : 'https://api-sandbox.modulrfinance.com/api';
  }

  getSupportedCapabilities(): string[] { return ['GBP_COLLECTION', 'GBP_PAYOUT']; }

  private getHeaders(): Record<string, string> {
    const nonce = Date.now().toString();
    const signature = createHmac('sha1', this.apiSecret)
      .update(`date: ${new Date().toUTCString()}\nx-mod-nonce: ${nonce}`)
      .digest('base64');

    return {
      'Authorization': `Signature keyId="${this.apiKey}",algorithm="hmac-sha1",headers="date x-mod-nonce",signature="${signature}"`,
      'Date': new Date().toUTCString(),
      'x-mod-nonce': nonce,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Generates a unique virtual account for a specific customer/transaction to receive funds.
   */
  async initiateFunding(request: FundingRequest): Promise<FundingResult> {
    if (this.environment === ConnectorEnvironment.PRODUCTION && process.env.REAL_MONEY_ENABLED !== 'true') {
      throw new Error('Modulr Connector SUSPENDED: REAL_MONEY_ENABLED is false');
    }

    try {
      // 1. Create a specific payment reference/virtual account for this transaction
      const response = await axios.post(`${this.baseUrl}/accounts`, {
        customerId: 'C123456', // The GYB internal customer entity mapped to Modulr
        currency: request.currency,
        externalReference: request.railTransactionId,
        productCode: 'VIRTUAL_ACCOUNT'
      }, { headers: this.getHeaders() });

      return {
        requestId: request.requestId,
        providerReference: response.data.id,
        status: FundingState.FUNDING_PENDING
      };
    } catch (error: any) {
      console.error('[MODULR] Initiate funding failed', error.response?.data || error.message);
      return { requestId: request.requestId, providerReference: '', status: FundingState.FUNDING_FAILED };
    }
  }

  async getFundingStatus(providerReference: string): Promise<FundingState> {
    try {
      // Check transactions hitting the virtual account
      const response = await axios.get(`${this.baseUrl}/accounts/${providerReference}/transactions`, {
        headers: this.getHeaders()
      });

      const txs = response.data.content;
      if (txs.length > 0 && txs[0].status === 'PROCESSED') {
        return FundingState.FUNDING_CONFIRMED;
      }
      return FundingState.FUNDING_PENDING;
    } catch (error) {
      return FundingState.FUNDING_FAILED;
    }
  }

  // Modulr is used for funding in this corridor, not settlement to India.
  async initiateSettlement(instruction: SettlementInstruction): Promise<SettlementResult> {
    throw new Error('Modulr not configured for INR settlement');
  }

  async getSettlementStatus(providerReference: string): Promise<SettlementState> {
    throw new Error('Not implemented');
  }

  async cancelSettlement(providerReference: string): Promise<boolean> { return false; }
  async reverseSettlement(providerReference: string): Promise<boolean> { return false; }
  async validateBeneficiary(accountToken: string, country: string): Promise<BeneficiaryValidationResult> {
    return { accountToken, isValid: true, nameMatchResult: 'NOT_SUPPORTED', riskFlags: [] };
  }
  async reconcile(providerReference: string): Promise<boolean> { return true; }
  
  async healthCheck(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/customers/ping`, { headers: this.getHeaders() });
      return true;
    } catch {
      return false;
    }
  }
}
