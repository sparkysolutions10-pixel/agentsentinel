/**
 * Priority-weighted in-memory registry for SentinelRule instances.
 */
export class RuleRegistry {
    rules = new Map();
    /**
     * Registers a single SentinelRule into the registry.
     */
    register(rule) {
        if (!rule || !rule.id) {
            throw new TypeError('[AgentSentinel] Cannot register rule: missing rule.id');
        }
        this.rules.set(rule.id, rule);
        return this;
    }
    /**
     * Registers an array of SentinelRules.
     */
    registerMany(rules) {
        for (const rule of rules) {
            this.register(rule);
        }
        return this;
    }
    /**
     * Dynamically injects or hot-swaps a SentinelRule at runtime.
     */
    inject(rule) {
        return this.register(rule);
    }
    /**
     * Revokes a rule by ID at runtime. Returns true if removed, false otherwise.
     */
    revoke(ruleId) {
        return this.unregister(ruleId);
    }
    /**
     * Revokes multiple rules by their IDs. Returns count of successfully revoked rules.
     */
    revokeMany(ruleIds) {
        let count = 0;
        for (const id of ruleIds) {
            if (this.unregister(id)) {
                count++;
            }
        }
        return count;
    }
    /**
     * Unregisters a rule by ID. Returns true if removed, false otherwise.
     */
    unregister(ruleId) {
        return this.rules.delete(ruleId);
    }
    /**
     * Returns a rule by ID, or undefined if not found.
     */
    get(ruleId) {
        return this.rules.get(ruleId);
    }
    /**
     * Checks if a rule with the specified ID exists in the registry.
     */
    has(ruleId) {
        return this.rules.has(ruleId);
    }
    /**
     * Returns all registered rules sorted by descending numeric priority.
     */
    getAll() {
        return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
    }
    /**
     * Returns all registered rules for a given ToolCategory sorted by descending priority.
     */
    getByCategory(category) {
        return this.getAll().filter((r) => r.category === category);
    }
    /**
     * Enables a registered rule by ID.
     */
    enable(ruleId) {
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
    disable(ruleId) {
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
    clear() {
        this.rules.clear();
    }
    /**
     * Total number of registered rules.
     */
    get size() {
        return this.rules.size;
    }
}
//# sourceMappingURL=ruleset.js.map