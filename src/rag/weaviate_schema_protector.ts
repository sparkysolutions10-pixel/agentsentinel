import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createWeaviateSchemaProtectorRule(): SentinelRule {
  return {
    id: 'rag-weaviate-schema-protector',
    name: 'Block Unauthorized Weaviate Schema and Property Introspection',
    category: 'custom',
    priority: 940,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const isSchemaIntrospect = ctx.toolName.toLowerCase().includes('weaviate') && 
        (ctx.toolName.includes('dump_schema') || ctx.toolName.includes('export_schema') || ctx.params?.action === 'dump_schema');
      if (isSchemaIntrospect) {
        return {
          ruleId: 'rag-weaviate-schema-protector',
          ruleName: 'Block Unauthorized Weaviate Schema and Property Introspection',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: 'Unauthorized bulk schema extraction or class property introspection detected.',
          detectedPattern: ctx.toolName,
        };
      }
      return null;
    }
  };
}
