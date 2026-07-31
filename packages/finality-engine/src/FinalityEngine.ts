export type StandardFinalityState = 'PENDING' | 'SOFT_CONFIRMED' | 'CONFIRMED' | 'FINAL' | 'FAILED' | 'ROLLED_BACK' | 'EXPIRED' | 'TIMEOUT';

export interface IFinalityEngine {
  mapProviderState(providerId: string, providerState: string): StandardFinalityState;
  isTerminalState(state: StandardFinalityState): boolean;
}

export class FinalityEngine implements IFinalityEngine {
  // Mapping of ProviderID -> ProviderState -> StandardFinalityState
  private stateMappings: Map<string, Map<string, StandardFinalityState>> = new Map();

  public registerProviderMapping(providerId: string, mapping: Record<string, StandardFinalityState>) {
    const providerMap = new Map<string, StandardFinalityState>();
    for (const [key, value] of Object.entries(mapping)) {
      providerMap.set(key, value);
    }
    this.stateMappings.set(providerId, providerMap);
  }

  public mapProviderState(providerId: string, providerState: string): StandardFinalityState {
    const mapping = this.stateMappings.get(providerId);
    if (!mapping) {
      // Default fallback
      return 'PENDING';
    }
    return mapping.get(providerState) || 'PENDING';
  }

  public isTerminalState(state: StandardFinalityState): boolean {
    return ['FINAL', 'FAILED', 'ROLLED_BACK', 'EXPIRED', 'TIMEOUT'].includes(state);
  }
}
