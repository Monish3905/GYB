export class ConfigurationPlatform {
  public async getFeatureFlag(flagName: string): Promise<boolean> {
    return true; // Simplified
  }

  public async getRuntimeConfig(configKey: string): Promise<any> {
    return {};
  }
}
