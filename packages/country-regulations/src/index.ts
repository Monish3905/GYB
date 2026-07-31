export interface CountryRegulation { countryCode: string; riskLevel: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'; fatfStatus: string; amlRequired: boolean; kycRequired: boolean; }
export class CountryRegulatoryRegistry {
  private reg: Map<string, CountryRegulation> = new Map();
  public register(r: CountryRegulation): void { this.reg.set(r.countryCode, r); }
  public getRegulation(code: string): CountryRegulation | undefined { return this.reg.get(code); }
}
