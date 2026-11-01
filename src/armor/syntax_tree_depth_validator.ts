import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

function computeObjectDepth(obj: any, currentDepth = 1): number {
  if (obj === null || typeof obj !== 'object') {
    return currentDepth;
  }
  let maxChildDepth = currentDepth;
  for (const key of Object.keys(obj)) {
    const childDepth = computeObjectDepth(obj[key], currentDepth + 1);
    if (childDepth > maxChildDepth) {
      maxChildDepth = childDepth;
    }
  }
  return maxChildDepth;
}

export function createSyntaxTreeDepthValidatorRule(maxAllowedDepth = 16): SentinelRule {
  return {
    id: 'armor-syntax-tree-depth-validator',
    name: 'Syntax Tree Depth Validator for Structured Prompts',
    category: 'custom',
    priority: 940,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      if (!ctx.params || typeof ctx.params !== 'object') {
        return null;
      }

      const depth = computeObjectDepth(ctx.params);
      if (depth > maxAllowedDepth) {
        return {
          ruleId: 'armor-syntax-tree-depth-validator',
          ruleName: 'Syntax Tree Depth Validator for Structured Prompts',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Structured prompt syntax tree depth (${depth}) exceeds allowed threshold (${maxAllowedDepth}).`,
          detectedPattern: `tree-depth-${depth}`
        };
      }

      return null;
    }
  };
}
