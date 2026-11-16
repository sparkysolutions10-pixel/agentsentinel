import { SentinelRule, ToolCategory } from './types.js';
/**
 * Priority-weighted in-memory registry for SentinelRule instances.
 */
export declare class RuleRegistry {
    private rules;
    /**
     * Registers a single SentinelRule into the registry.
     */
    register(rule: SentinelRule): this;
    /**
     * Registers an array of SentinelRules.
     */
    registerMany(rules: SentinelRule[]): this;
    /**
     * Dynamically injects or hot-swaps a SentinelRule at runtime.
     */
    inject(rule: SentinelRule): this;
    /**
     * Revokes a rule by ID at runtime. Returns true if removed, false otherwise.
     */
    revoke(ruleId: string): boolean;
    /**
     * Revokes multiple rules by their IDs. Returns count of successfully revoked rules.
     */
    revokeMany(ruleIds: string[]): number;
    /**
     * Unregisters a rule by ID. Returns true if removed, false otherwise.
     */
    unregister(ruleId: string): boolean;
    /**
     * Returns a rule by ID, or undefined if not found.
     */
    get(ruleId: string): SentinelRule | undefined;
    /**
     * Checks if a rule with the specified ID exists in the registry.
     */
    has(ruleId: string): boolean;
    /**
     * Returns all registered rules sorted by descending numeric priority.
     */
    getAll(): SentinelRule[];
    /**
     * Returns all registered rules for a given ToolCategory sorted by descending priority.
     */
    getByCategory(category: ToolCategory): SentinelRule[];
    /**
     * Enables a registered rule by ID.
     */
    enable(ruleId: string): boolean;
    /**
     * Disables a registered rule by ID.
     */
    disable(ruleId: string): boolean;
    /**
     * Clears all registered rules from the registry.
     */
    clear(): void;
    /**
     * Total number of registered rules.
     */
    get size(): number;
}
//# sourceMappingURL=ruleset.d.ts.map