export enum KYCStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export interface User {
  id: string;                    // UUID
  email: string;                 // Unique
  phone?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;           // ISO 3166-1 alpha-2
  
  // KYC status
  kycStatus: KYCStatus;
  kycScore: number;              // 0-100
  kycVerifiedAt?: Date;
  kycExpiresAt?: Date;
  
  // Risk profile
  riskProfile: 'low' | 'medium' | 'high';
  riskFactors: string[];         // ['round_tripping', 'high_velocity', ...]
  
  // Account status
  isActive: boolean;
  isVerified: boolean;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface KYCData {
  id: string;
  userId: string;
  documentType: 'passport' | 'national_id' | 'driver_license';
  documentNumber: string;
  documentExpiry: Date;
  documentIssuer: string;
  proofOfAddressType: 'utility_bill' | 'bank_statement' | 'lease';
  proofOfAddressUrl: string;
  verificationTimestamp: Date;
  verifiedBy: string;
}
