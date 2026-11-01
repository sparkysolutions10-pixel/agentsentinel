import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createRagAuditLoggerRule(): SentinelRule {
  return {
    id: 'rag-audit-event-logger',
    name: 'Tamper-Evident RAG Security Audit Logger',
    category: 'custom',
    priority: 810,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const isVectorOp = ctx.toolName.toLowerCase().includes('vector') || ctx.toolName.toLowerCase().includes('rag');
      if (isVectorOp && ctx.params?.disableAuditLog === true) {
        return {
          ruleId: 'rag-audit-event-logger',
          ruleName: 'Tamper-Evident RAG Security Audit Logger',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Vector operation attempted to disable required immutable audit event logging.',
          detectedPattern: 'disable-audit-log-tamper',
        };
      }
      return null;
    }
  };
}
