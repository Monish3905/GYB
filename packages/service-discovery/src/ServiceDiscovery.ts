export class ServiceDiscovery {
  private registry: Map<string, string> = new Map();

  public async registerService(name: string, endpoint: string): Promise<void> {
    this.registry.set(name, endpoint);
    console.log(`[DISCOVERY] Registered service ${name} at ${endpoint}`);
  }

  public async resolveService(name: string): Promise<string | undefined> {
    return this.registry.get(name);
  }
}
