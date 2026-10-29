import { describe, it, expect } from 'vitest';
import { RuleRegistry } from '../src/ruleset.js';
import { SentinelRule, Verdict } from '../src/types.js';

describe('RuleRegistry & Priority-Weighted Execution (Issue #6)', () => {
  it('registers rules and returns them sorted by descending priority', () => {
    const registry = new RuleRegistry();

    const lowRule: SentinelRule = {
      id: 'low-rule',
      name: 'Low Rule',
      category: 'custom',
      priority: 10,
      enabled: true,
      evaluate: () => null
    };

    const highRule: SentinelRule = {
      id: 'high-rule',
      name: 'High Rule',
      category: 'shell',
      priority: 100,
      enabled: true,
      evaluate: () => null
    };

    const midRule: SentinelRule = {
      id: 'mid-rule',
      name: 'Mid Rule',
      category: 'network',
      priority: 50,
      enabled: true,
      evaluate: () => null
    };

    registry.registerMany([lowRule, highRule, midRule]);

    expect(registry.size).toBe(3);
    const sorted = registry.getAll();
    expect(sorted.map((r) => r.id)).toEqual(['high-rule', 'mid-rule', 'low-rule']);
  });

  it('filters rules by ToolCategory while maintaining priority ordering', () => {
    const registry = new RuleRegistry();

    registry.registerMany([
      { id: 'shell-1', name: 'S1', category: 'shell', priority: 20, enabled: true, evaluate: () => null },
      { id: 'shell-2', name: 'S2', category: 'shell', priority: 80, enabled: true, evaluate: () => null },
      { id: 'sql-1', name: 'Q1', category: 'sql', priority: 90, enabled: true, evaluate: () => null }
    ]);

    const shellRules = registry.getByCategory('shell');
    expect(shellRules.length).toBe(2);
    expect(shellRules.map((r) => r.id)).toEqual(['shell-2', 'shell-1']);

    const sqlRules = registry.getByCategory('sql');
    expect(sqlRules.length).toBe(1);
    expect(sqlRules[0].id).toBe('sql-1');
  });

  it('supports enable, disable, and unregister lifecycle controls', () => {
    const registry = new RuleRegistry();
    const rule: SentinelRule = {
      id: 'toggle-rule',
      name: 'Toggle Rule',
      category: 'secrets',
      priority: 40,
      enabled: true,
      evaluate: () => null
    };

    registry.register(rule);
    expect(registry.get('toggle-rule')?.enabled).toBe(true);

    registry.disable('toggle-rule');
    expect(registry.get('toggle-rule')?.enabled).toBe(false);

    registry.enable('toggle-rule');
    expect(registry.get('toggle-rule')?.enabled).toBe(true);

    expect(registry.unregister('toggle-rule')).toBe(true);
    expect(registry.has('toggle-rule')).toBe(false);
    expect(registry.size).toBe(0);
  });
});
