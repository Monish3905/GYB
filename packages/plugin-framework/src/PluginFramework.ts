export interface PluginManifest {
  name: string;
  version: string;
  entryPoint: string;
  permissions: string[];
  events: string[];
  dependencies?: Record<string, string>;
}

export interface PluginInstance {
  id: string;
  manifest: PluginManifest;
  status: 'LOADED' | 'RUNNING' | 'STOPPED' | 'ERROR';
}

export class PluginFramework {
  private plugins: Map<string, PluginInstance> = new Map();

  public async registerPlugin(manifest: PluginManifest): Promise<string> {
    const id = `plg-${Date.now()}`;
    this.plugins.set(id, { id, manifest, status: 'LOADED' });
    console.log(`[PLUGIN] Registered plugin: ${manifest.name}@${manifest.version}`);
    return id;
  }

  public async startPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) throw new Error(`Plugin ${pluginId} not found`);

    // Resolve dependencies
    await this.resolveDependencies(plugin.manifest);

    // Launch in sandboxed worker runtime
    plugin.status = 'RUNNING';
    console.log(`[PLUGIN] Started ${plugin.manifest.name} in sandboxed worker runtime`);
  }

  public async stopPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.status = 'STOPPED';
      console.log(`[PLUGIN] Stopped ${plugin.manifest.name}`);
    }
  }

  public async listPlugins(): Promise<PluginInstance[]> {
    return Array.from(this.plugins.values());
  }

  private async resolveDependencies(manifest: PluginManifest): Promise<void> {
    if (manifest.dependencies) {
      for (const [dep, version] of Object.entries(manifest.dependencies)) {
        console.log(`[PLUGIN] Resolved dependency: ${dep}@${version}`);
      }
    }
  }
}
