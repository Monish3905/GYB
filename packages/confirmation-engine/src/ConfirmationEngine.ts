import { FinalityEngine, StandardFinalityState } from '@payment-os/finality-engine';
import { IExecutionProvider } from '@payment-os/execution-engine';

export class ConfirmationEngine {
  constructor(private finalityEngine: FinalityEngine) {}

  public async checkConfirmationStatus(
    provider: IExecutionProvider,
    referenceId: string
  ): Promise<StandardFinalityState> {
    try {
      const rawState = await provider.getStatus(referenceId);
      return this.finalityEngine.mapProviderState(provider.providerId, rawState);
    } catch (error) {
      // Handle timeout or connection issues
      return 'TIMEOUT';
    }
  }

  public async pollForFinality(
    provider: IExecutionProvider,
    referenceId: string,
    timeoutMs: number,
    pollIntervalMs: number = 2000
  ): Promise<StandardFinalityState> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const state = await this.checkConfirmationStatus(provider, referenceId);
      if (this.finalityEngine.isTerminalState(state)) {
        return state;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    return 'TIMEOUT';
  }
}
