export interface NetworkParticipant {
  id: string;
  name: string;
  type: 'BANK' | 'FINTECH' | 'PSP' | 'WALLET' | 'CRYPTO_EXCHANGE';
  bicCode: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'ONBOARDING';
}

export class ParticipantManager {
  public async onboardParticipant(participant: Omit<NetworkParticipant, 'id' | 'status'>): Promise<NetworkParticipant> {
    console.log(`[PARTICIPANT MGR] Onboarding ${participant.type}: ${participant.name}`);
    return {
      id: `part-${Date.now()}`,
      status: 'ONBOARDING',
      ...participant
    };
  }

  public async getParticipant(id: string): Promise<NetworkParticipant | null> {
    return null; // Mock DB retrieval
  }
}
