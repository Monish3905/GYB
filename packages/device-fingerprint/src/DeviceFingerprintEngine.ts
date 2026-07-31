export interface DeviceProfile {
  fingerprint: string;
  ip: string;
  userAgent: string;
  country: string;
  isKnownDevice: boolean;
  riskScore: number;
}

export class DeviceFingerprintEngine {
  private knownDevices: Set<string> = new Set();

  public registerDevice(fingerprint: string): void {
    this.knownDevices.add(fingerprint);
  }

  public evaluate(fingerprint: string, ip: string, country: string, userAgent: string): DeviceProfile {
    const isKnown = this.knownDevices.has(fingerprint);
    let riskScore = 0;

    if (!isKnown) riskScore += 30;
    if (country === 'TOR' || ip.startsWith('10.')) riskScore += 40; // Proxy/TOR detection mock

    return {
      fingerprint,
      ip,
      userAgent,
      country,
      isKnownDevice: isKnown,
      riskScore: Math.min(riskScore, 100)
    };
  }
}
