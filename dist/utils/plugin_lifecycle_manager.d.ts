export interface PluginDefinition {
    name: string;
    version: string;
    enabled: boolean;
}
export declare class PluginLifecycleManager {
    private plugins;
    register(plugin: PluginDefinition): void;
    enable(name: string): void;
    disable(name: string): void;
    getActivePlugins(): PluginDefinition[];
}
//# sourceMappingURL=plugin_lifecycle_manager.d.ts.map