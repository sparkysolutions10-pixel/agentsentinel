import {
  Verdict,
  ToolCategory,
  SentinelRule,
  ToolCallContext,
  RuleViolation,
  isVerdict
} from './types.js';

export interface DeclarativeRuleMatch {
  tools?: string[];
  patterns?: string[];
  paramMatch?: Record<string, any>;
}

export interface DeclarativeRuleAction {
  verdict: Verdict;
  reason: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  redactKeys?: string[];
}

export interface DeclarativeRuleDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  priority: number;
  enabled?: boolean;
  match: DeclarativeRuleMatch;
  action: DeclarativeRuleAction;
}

export interface DeclarativePolicyConfig {
  version: string;
  rules: DeclarativeRuleDefinition[];
}

/**
 * Validates a declarative JSON policy config against the AgentSentinel schema.
 */
export function validatePolicyConfig(raw: unknown): DeclarativePolicyConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new TypeError('[AgentSentinel] Policy configuration must be a JSON object.');
  }

  const obj = raw as Record<string, any>;

  if (typeof obj.version !== 'string' || !obj.version.trim()) {
    throw new TypeError('[AgentSentinel] Missing or invalid "version" string in policy configuration.');
  }

  if (!Array.isArray(obj.rules)) {
    throw new TypeError('[AgentSentinel] Missing or invalid "rules" array in policy configuration.');
  }

  const validatedRules: DeclarativeRuleDefinition[] = [];

  for (let i = 0; i < obj.rules.length; i++) {
    const r = obj.rules[i];
    if (!r || typeof r !== 'object' || Array.isArray(r)) {
      throw new TypeError(`[AgentSentinel] Rule at index ${i} must be an object.`);
    }

    if (typeof r.id !== 'string' || !r.id.trim()) {
      throw new TypeError(`[AgentSentinel] Rule at index ${i} is missing a valid "id".`);
    }

    if (typeof r.name !== 'string' || !r.name.trim()) {
      throw new TypeError(`[AgentSentinel] Rule "${r.id}" is missing a valid "name".`);
    }

    if (typeof r.priority !== 'number' || !Number.isFinite(r.priority)) {
      throw new TypeError(`[AgentSentinel] Rule "${r.id}" must have a numeric "priority".`);
    }

    if (!r.action || typeof r.action !== 'object') {
      throw new TypeError(`[AgentSentinel] Rule "${r.id}" is missing an "action" block.`);
    }

    if (!isVerdict(r.action.verdict)) {
      throw new TypeError(`[AgentSentinel] Rule "${r.id}" has invalid verdict "${r.action.verdict}". Expected ALLOW, BLOCK, REDACT, or CONFIRM.`);
    }

    if (typeof r.action.reason !== 'string' || !r.action.reason.trim()) {
      throw new TypeError(`[AgentSentinel] Rule "${r.id}" must specify an action "reason".`);
    }

    const category: ToolCategory = typeof r.category === 'string' ? r.category : 'custom';

    validatedRules.push({
      id: r.id.trim(),
      name: r.name.trim(),
      category,
      priority: r.priority,
      enabled: r.enabled !== false,
      match: {
        tools: Array.isArray(r.match?.tools) ? r.match.tools : undefined,
        patterns: Array.isArray(r.match?.patterns) ? r.match.patterns : undefined,
        paramMatch: r.match?.paramMatch && typeof r.match.paramMatch === 'object' ? r.match.paramMatch : undefined
      },
      action: {
        verdict: r.action.verdict,
        reason: r.action.reason.trim(),
        severity: r.action.severity ?? (r.action.verdict === Verdict.BLOCK ? 'critical' : 'medium'),
        redactKeys: Array.isArray(r.action.redactKeys) ? r.action.redactKeys : undefined
      }
    });
  }

  return {
    version: obj.version.trim(),
    rules: validatedRules
  };
}

/**
 * Compiles a DeclarativeRuleDefinition into an executable SentinelRule.
 */
export function compileDeclarativeRule(def: DeclarativeRuleDefinition): SentinelRule {
  return {
    id: def.id,
    name: def.name,
    category: def.category,
    priority: def.priority,
    enabled: def.enabled !== false,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      // 1. Tool name match (wildcard support)
      if (def.match.tools && def.match.tools.length > 0) {
        const matchesTool = def.match.tools.some((pattern) => {
          if (pattern === '*' || pattern === ctx.toolName) return true;
          if (pattern.endsWith('*')) {
            const prefix = pattern.slice(0, -1);
            return ctx.toolName.startsWith(prefix);
          }
          return false;
        });

        if (!matchesTool) return null;
      }

      // 2. Pattern match in string parameters
      if (def.match.patterns && def.match.patterns.length > 0) {
        const serialized = JSON.stringify(ctx.params).toLowerCase();
        const matchedPattern = def.match.patterns.find((p) => serialized.includes(p.toLowerCase()));
        if (!matchedPattern) return null;
      }

      // 3. Exact paramMatch
      if (def.match.paramMatch) {
        for (const [k, expected] of Object.entries(def.match.paramMatch)) {
          if (ctx.params[k] !== expected) return null;
        }
      }

      // Rule matched -> trigger violation
      const redactedParams = def.action.verdict === Verdict.REDACT && def.action.redactKeys
        ? { ...ctx.params }
        : undefined;

      if (redactedParams && def.action.redactKeys) {
        for (const key of def.action.redactKeys) {
          if (key in redactedParams) {
            redactedParams[key] = '[REDACTED]';
          }
        }
      }

      return {
        ruleId: def.id,
        ruleName: def.name,
        severity: def.action.severity ?? 'medium',
        verdict: def.action.verdict,
        reason: def.action.reason,
        redactedParams
      };
    }
  };
}
