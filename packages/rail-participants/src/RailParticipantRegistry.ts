export enum ParticipantType {
  GYB_NODE = 'GYB_NODE',
  PSP = 'PSP',
  BANK = 'BANK',
  LIQUIDITY_PROVIDER = 'LIQUIDITY_PROVIDER',
  FX_PROVIDER = 'FX_PROVIDER',
  SETTLEMENT_PROVIDER = 'SETTLEMENT_PROVIDER'
}

export enum ParticipantStatus {
  REGISTERED = 'REGISTERED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  QUARANTINED = 'QUARANTINED',
  DEACTIVATED = 'DEACTIVATED'
}

export interface RailParticipant {
  participantId: string;
  type: ParticipantType;
  jurisdiction: string;
  status: ParticipantStatus;
  supportedCurrencies: string[];
  publicKey: string;
  complianceStatus: string;
}

export class RailParticipantRegistry {
  private participants: Map<string, RailParticipant> = new Map();

  public register(participant: RailParticipant): void {
    this.participants.set(participant.participantId, participant);
  }

  public getParticipant(id: string): RailParticipant | undefined {
    return this.participants.get(id);
  }

  public isActive(id: string): boolean {
    const p = this.participants.get(id);
    return p ? p.status === ParticipantStatus.ACTIVE : false;
  }
}
