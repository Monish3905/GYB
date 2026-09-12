import axios from 'axios';

export interface ApplicantResult {
  applicantId: string;
  status: 'CLEAR' | 'CONSIDER' | 'PENDING';
}

/**
 * Onfido KYC Provider Integration
 * Implements the real Onfido API contract for document & biometric identity verification.
 */
export class OnfidoKycProvider {
  private apiToken: string;
  private baseUrl: string;

  constructor(apiToken: string, environment: 'sandbox' | 'live' = 'sandbox') {
    this.apiToken = apiToken;
    this.baseUrl = environment === 'live' 
      ? 'https://api.onfido.com/v3.6' 
      : 'https://api.sandbox.onfido.com/v3.6';
  }

  /**
   * Step 1: Create an Applicant
   */
  async createApplicant(firstName: string, lastName: string, dob: string, email: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/applicants`, {
        first_name: firstName,
        last_name: lastName,
        dob,
        email
      }, {
        headers: { Authorization: `Token token=${this.apiToken}` }
      });
      return response.data.id;
    } catch (error: any) {
      console.error('[ONFIDO] Failed to create applicant', error.response?.data || error.message);
      throw new Error('Onfido Applicant Creation Failed');
    }
  }

  /**
   * Step 2: Generate SDK Token for Frontend Web/Mobile Capture
   */
  async generateSdkToken(applicantId: string, referrer: string = '*://*/*'): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/sdk_token`, {
        applicant_id: applicantId,
        referrer
      }, {
        headers: { Authorization: `Token token=${this.apiToken}` }
      });
      return response.data.token;
    } catch (error: any) {
      console.error('[ONFIDO] Failed to generate SDK token', error.response?.data || error.message);
      throw new Error('Onfido SDK Token Generation Failed');
    }
  }

  /**
   * Step 3: Create a Check (Initiate Verification)
   * This is called after the user has uploaded documents via the SDK.
   */
  async createCheck(applicantId: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/checks`, {
        applicant_id: applicantId,
        report_names: ['document', 'facial_similarity_photo']
      }, {
        headers: { Authorization: `Token token=${this.apiToken}` }
      });
      return response.data.id; // Check ID
    } catch (error: any) {
      console.error('[ONFIDO] Failed to create check', error.response?.data || error.message);
      throw new Error('Onfido Check Creation Failed');
    }
  }

  /**
   * Check status polling / Webhook parsing
   */
  async getCheckStatus(checkId: string): Promise<ApplicantResult> {
    try {
      const response = await axios.get(`${this.baseUrl}/checks/${checkId}`, {
        headers: { Authorization: `Token token=${this.apiToken}` }
      });
      
      const status = response.data.status;
      const result = response.data.result;

      if (status !== 'complete') return { applicantId: response.data.applicant_id, status: 'PENDING' };
      return { 
        applicantId: response.data.applicant_id, 
        status: result === 'clear' ? 'CLEAR' : 'CONSIDER' 
      };
    } catch (error: any) {
      console.error('[ONFIDO] Failed to get check status', error.response?.data || error.message);
      throw new Error('Onfido Status Fetch Failed');
    }
  }
}
