import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface GrammarSchemaConfig {
  disallowedProperties?: string[];
  maxProperties?: number;
}

export function createGrammarSchemaGuardRule(config?: GrammarSchemaConfig): SentinelRule {
  const disallowed = config?.disallowedProperties || [
    '__proto__',
    'constructor',
    'override_system_prompt',
    'bypass_security',
    'admin_token',
    'raw_eval'
  ];
  const maxProps = config?.maxProperties || 50;

  return {
    id: 'armor-grammar-schema-guard',
    name: 'Grammar-Based JSON Schema Prompt Injector Defense',
    category: 'custom',
    priority: 930,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      if (!ctx.params || typeof ctx.params !== 'object') {
        return null;
      }

      const rawJson = JSON.stringify(ctx.params);
      if (rawJson.includes('"__proto__"')) {
        return {
          ruleId: 'armor-grammar-schema-guard',
          ruleName: 'Grammar-Based JSON Schema Prompt Injector Defense',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'JSON schema deviation: disallowed payload property injected: "__proto__".',
          detectedPattern: '__proto__'
        };
      }

      const keys = Object.keys(ctx.params);
      if (keys.length > maxProps) {
        return {
          ruleId: 'armor-grammar-schema-guard',
          ruleName: 'Grammar-Based JSON Schema Prompt Injector Defense',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `JSON schema deviation: property count (${keys.length}) exceeds ceiling (${maxProps}).`,
          detectedPattern: `property-overflow-${keys.length}`
        };
      }

      const allPropNames = Object.getOwnPropertyNames(ctx.params);
      for (const key of allPropNames) {
        if (disallowed.includes(key.toLowerCase())) {
          return {
            ruleId: 'armor-grammar-schema-guard',
            ruleName: 'Grammar-Based JSON Schema Prompt Injector Defense',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `JSON schema deviation: disallowed payload property injected: "${key}".`,
            detectedPattern: key
          };
        }
      }

      return null;
    }
  };
}
