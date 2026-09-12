export interface AccessContext {
  identityId: string;
  deviceId: string;
  ipAddress: string;
  requestedResource: string;
  timeOfDay: string;
  authenticationMethod: string;
}

export class ZeroTrustEngine {
  public async evaluateTrust(context: AccessContext): Promise<{ granted: boolean, trustScore: number, reason?: string }> {
    const score = await this.calculateTrustScore(context);
    
    if (score < 40) {
      return { granted: false, trustScore: score, reason: 'Trust score too low. High risk context detected.' };
    }
    
    if (score >= 40 && score < 70) {
      // Could trigger a step-up authentication challenge here
      return { granted: false, trustScore: score, reason: 'MFA required for this trust level.' };
    }

    return { granted: true, trustScore: score };
  }

  private async calculateTrustScore(context: AccessContext): Promise<number> {
    let score = 100;
    
    // Penalize if not using strong auth
    if (context.authenticationMethod !== 'MFA' && context.authenticationMethod !== 'CERTIFICATE') {
      score -= 30;
    }
    
    // Check device registry (mock)
    const isDeviceTrusted = context.deviceId.startsWith('trusted-');
    if (!isDeviceTrusted) {
      score -= 40;
    }

    // Network context
    if (context.ipAddress.startsWith('unknown')) {
      score -= 20;
    }

    return Math.max(0, score);
  }
}
