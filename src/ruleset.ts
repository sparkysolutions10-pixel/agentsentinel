import { SentinelRule, ToolCategory } from './types.js';

/**
 * Priority-weighted in-memory registry for SentinelRule instances.
 */
export class RuleRegistry {
  private rules: Map<string, SentinelRule> = new Map();

  /**
   * Registers a single SentinelRule into the registry.
   */
  public register(rule: SentinelRule): this {
    if (!rule || !rule.id) {
      throw new TypeError('[AgentSentinel] Cannot register rule: missing rule.id');
    }
    this.rules.set(rule.id, rule);
    return this;
  }

  /**
   * Registers an array of SentinelRules.
   */
  public registerMany(rules: SentinelRule[]): this {
    for (const rule of rules) {
      this.register(rule);
    }
    return this;
  }

  /**
   * Unregisters a rule by ID. Returns true if removed, false otherwise.
   */
  public unregister(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Returns a rule by ID, or undefined if not found.
   */
  public get(ruleId: string): SentinelRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Checks if a rule with the specified ID exists in the registry.
   */
  public has(ruleId: string): boolean {
    return this.rules.has(ruleId);
  }

  /**
   * Returns all registered rules sorted by descending numeric priority.
   */
  public getAll(): SentinelRule[] {
    return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Returns all registered rules for a given ToolCategory sorted by descending priority.
   */
  public getByCategory(category: ToolCategory): SentinelRule[] {
    return this.getAll().filter((r) => r.category === category);
  }

  /**
   * Enables a registered rule by ID.
   */
  public enable(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
      return true;
    }
    return false;
  }

  /**
   * Disables a registered rule by ID.
   */
  public disable(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
      return true;
    }
    return false;
  }

  /**
   * Clears all registered rules from the registry.
   */
  public clear(): void {
    this.rules.clear();
  }

  /**
   * Total number of registered rules.
   */
  public get size(): number {
    return this.rules.size;
  }
}
