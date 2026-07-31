export interface ComplianceCheck {
  id: string;
  transactionId: string;
  userId: string;
  
  // Individual checks
  checks: {
    name: string;                 // 'kyc_status', 'sanctions_screening', etc.
    passed: boolean;
    riskContribution: number;     // 0-100
    details?: object;
  }[];
  
  // Overall result
  approved: boolean;
  riskScore: number;              // 0-100
  reason?: string;
  
  // Manual review
  requiresManualReview: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  
  // Audit
  createdAt: Date;
  completedAt?: Date;
}

export interface SanctionsList {
  id: string;
  listName: string;               // 'OFAC SDN', 'EU CFSP', 'UN SC'
  entityName: string;
  entityType: 'person' | 'organization' | 'address' | 'country';
  identifierType: string;         // 'name', 'passport', 'email', 'blockchain_address'
  identifierValue: string;
  countryISO?: string;
  listSource: string;
  isActive: boolean;
  addedAt: Date;
  expiredAt?: Date;
}
