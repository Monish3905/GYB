export interface BeneficiaryDetails {
  accountToken: string;
  country: string;
  currency: string;
  institutionName: string;
  accountHolderName: string;
}

export interface ValidationResult {
  isValid: boolean;
  nameMatch: 'EXACT' | 'PARTIAL' | 'MISMATCH' | 'NOT_SUPPORTED';
  accountStatus: 'ACTIVE' | 'CLOSED' | 'BLOCKED' | 'UNKNOWN';
  riskFlags: string[];
}

export class BeneficiaryValidationEngine {
  public async validate(beneficiary: BeneficiaryDetails): Promise<ValidationResult> {
    // Basic structural validation
    if (!beneficiary.accountToken || !beneficiary.country || !beneficiary.currency) {
      return {
        isValid: false,
        nameMatch: 'NOT_SUPPORTED',
        accountStatus: 'UNKNOWN',
        riskFlags: ['MISSING_REQUIRED_FIELDS']
      };
    }

    // In production, this delegates to the financial connector's validateBeneficiary()
    // For sandbox, we simulate a successful validation
    return {
      isValid: true,
      nameMatch: 'EXACT',
      accountStatus: 'ACTIVE',
      riskFlags: []
    };
  }
}
