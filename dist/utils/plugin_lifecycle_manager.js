export class PluginLifecycleManager {
    plugins = new Map();
    register(plugin) {
        this.plugins.set(plugin.name, { ...plugin });
    }
    enable(name) {
        const p = this.plugins.get(name);
        if (p)
            p.enabled = true;
    }
    disable(name) {
        const p = this.plugins.get(name);
        if (p)
            p.enabled = false;
    }
    getActivePlugins() {
        return Array.from(this.plugins.values()).filter(p => p.enabled);
    }
}
//# sourceMappingURL=plugin_lifecycle_manager.js.map