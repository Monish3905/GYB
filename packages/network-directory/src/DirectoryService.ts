export interface ParticipantProfile {
  id: string;
  name: string;
  supportedCurrencies: string[];
  supportedCorridors: string[];
  services: string[];
}

export class DirectoryService {
  public async lookupParticipant(bicCode: string): Promise<ParticipantProfile | null> {
    console.log(`[DIRECTORY] Looking up participant with BIC: ${bicCode}`);
    return {
      id: 'mock-id',
      name: 'Bank of GYB',
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
      supportedCorridors: ['US-EU', 'EU-UK'],
      services: ['RTGS', 'DNS', 'FX']
    };
  }

  public async getActiveParticipants(): Promise<ParticipantProfile[]> {
    return [];
  }
}
