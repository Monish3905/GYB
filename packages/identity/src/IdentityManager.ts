export interface Identity {
  id: string;
  type: 'INDIVIDUAL' | 'BUSINESS' | 'BANK' | 'MERCHANT' | 'VASP';
  status: 'DRAFT' | 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED' | 'ARCHIVED';
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  country: string;
  jurisdiction: string;
  linkedWallets: string[];
}

export class IdentityManager {
  private identities: Map<string, Identity> = new Map();

  public createIdentity(identity: Identity): void {
    this.identities.set(identity.id, identity);
  }

  public getIdentity(id: string): Identity | undefined {
    return this.identities.get(id);
  }

  public updateStatus(id: string, status: Identity['status']): void {
    const identity = this.identities.get(id);
    if (identity) {
      identity.status = status;
    }
  }
}
