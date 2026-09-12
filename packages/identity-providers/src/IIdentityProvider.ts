export interface IdentityProviderConfig {
  clientId: string;
  clientSecret?: string;
  issuerUrl: string;
  scopes: string[];
}

export interface IIdentityProvider {
  authenticateUser(credentials: Record<string, any>): Promise<string | null>;
  validateToken(token: string): Promise<boolean>;
  getUserProfile(token: string): Promise<Record<string, any>>;
}
