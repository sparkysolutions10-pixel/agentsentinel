import { describe, it, expect } from 'vitest';
import { PluginLifecycleManager } from '../src/utils/plugin_lifecycle_manager.js';

describe('PluginLifecycleManager', () => {
  it('manages plugin registration and enablement states', () => {
    const mgr = new PluginLifecycleManager();
    mgr.register({ name: 'audit_plugin', version: '1.0.0', enabled: false });
    expect(mgr.getActivePlugins().length).toBe(0);
    mgr.enable('audit_plugin');
    expect(mgr.getActivePlugins().length).toBe(1);
    mgr.disable('audit_plugin');
    expect(mgr.getActivePlugins().length).toBe(0);
  });
});
