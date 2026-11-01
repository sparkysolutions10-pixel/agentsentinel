import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function calculateBraceDepth(query: string): number {
  let maxDepth = 0;
  let currentDepth = 0;
  for (const ch of query) {
    if (ch === '{') {
      currentDepth++;
      if (currentDepth > maxDepth) maxDepth = currentDepth;
    } else if (ch === '}') {
      if (currentDepth > 0) currentDepth--;
    }
  }
  return maxDepth;
}

export function createWeaviateGraphQLLimiterRule(maxDepth: number = 6): SentinelRule {
  return {
    id: 'rag-weaviate-graphql-limiter',
    name: 'Throttle Excessive Weaviate GraphQL Query Depth and Complexity',
    category: 'custom',
    priority: 940,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const isGraphQL = ctx.toolName.toLowerCase().includes('weaviate') && (ctx.params?.query || ctx.toolName.includes('graphql'));
      if (!isGraphQL) return null;
      const queryStr = ctx.params?.query ?? ctx.params?.gql;
      if (typeof queryStr === 'string') {
        const depth = calculateBraceDepth(queryStr);
        if (depth > maxDepth) {
          return {
            ruleId: 'rag-weaviate-graphql-limiter',
            ruleName: 'Throttle Excessive Weaviate GraphQL Query Depth and Complexity',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Weaviate GraphQL query nesting depth (${depth}) exceeds maximum limit of ${maxDepth}. Risk of circular object traversal.`,
            detectedPattern: `queryDepth=${depth} > ${maxDepth}`,
          };
        }
      }
      return null;
    }
  };
}
