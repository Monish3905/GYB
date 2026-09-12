import { ExternalSettlementAdapter, SettlementRequest, SettlementResult } from '../../external-settlement/src/ExternalSettlementAdapter';

export class SandboxFinancialNetwork implements ExternalSettlementAdapter {
  private simulateFailure = false;
  private failureReason = '';

  public injectFailure(reason: string) {
    this.simulateFailure = true;
    this.failureReason = reason;
  }

  public resetFailure() {
    this.simulateFailure = false;
    this.failureReason = '';
  }

  public async quote(sourceAmount: number, sourceCurrency: string, destCurrency: string): Promise<number> {
    if (this.simulateFailure && this.failureReason === 'FX_UNAVAILABLE') {
      throw new Error('Sandbox: FX Provider Unavailable');
    }
    // Fixed sandbox rate GBP -> INR
    return sourceAmount * 105.5; 
  }

  public async validateBeneficiary(beneficiary: any): Promise<boolean> {
    return true;
  }

  public async reserveLiquidity(amount: number, currency: string): Promise<boolean> {
    if (this.simulateFailure && this.failureReason === 'INSUFFICIENT_LIQUIDITY') {
      return false;
    }
    return true;
  }

  public async initiateSettlement(request: SettlementRequest): Promise<SettlementResult> {
    if (this.simulateFailure) {
      if (this.failureReason === 'PROVIDER_TIMEOUT') {
        throw new Error('Sandbox: Provider Timeout');
      }
      if (this.failureReason === 'SETTLEMENT_FAILURE') {
        return { success: false, errorCode: 'SANDBOX_REJECTED' };
      }
    }
    
    return {
      success: true,
      providerReference: `sandbox-ref-${Date.now()}`
    };
  }

  public async getSettlementStatus(providerRef: string): Promise<string> {
    return 'COMPLETED';
  }

  public async cancel(providerRef: string): Promise<boolean> {
    return true;
  }

  public async reverse(providerRef: string): Promise<boolean> {
    return true;
  }

  public async reconcile(providerRef: string): Promise<boolean> {
    return true;
  }
}
