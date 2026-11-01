import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createUnifiedRagPipelineRule(): SentinelRule {
  return {
    id: 'rag-unified-pipeline-orchestrator',
    name: 'Unified Vector RAG Security Pipeline Coordinator',
    category: 'custom',
    priority: 990,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const isRag = ctx.toolName.toLowerCase().includes('rag') || ctx.params?.pipeline === 'rag';
      if (!isRag) return null;

      const stage = ctx.params?.stage || 'query';
      if (ctx.params?.skipValidation === true || ctx.params?.bypassSecurity === true) {
        return {
          ruleId: 'rag-unified-pipeline-orchestrator',
          ruleName: 'Unified Vector RAG Security Pipeline Coordinator',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `RAG pipeline execution at stage '${stage}' attempted to bypass security filters.`,
          detectedPattern: 'rag-security-bypass-flag',
        };
      }
      return null;
    }
  };
}
