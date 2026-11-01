export interface PluginDefinition {
  name: string;
  version: string;
  enabled: boolean;
}

export class PluginLifecycleManager {
  private plugins: Map<string, PluginDefinition> = new Map();

  public register(plugin: PluginDefinition): void {
    this.plugins.set(plugin.name, { ...plugin });
  }

  public enable(name: string): void {
    const p = this.plugins.get(name);
    if (p) p.enabled = true;
  }

  public disable(name: string): void {
    const p = this.plugins.get(name);
    if (p) p.enabled = false;
  }

  public getActivePlugins(): PluginDefinition[] {
    return Array.from(this.plugins.values()).filter(p => p.enabled);
  }
}
