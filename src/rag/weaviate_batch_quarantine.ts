import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function inspectWeaviateBatchObjects(objects: any[]): { isValid: boolean; reason?: string } {
  if (!Array.isArray(objects)) return { isValid: true };
  if (objects.length > 1000) {
    return { isValid: false, reason: `Batch object count (${objects.length}) exceeds safety limit of 1000 items.` };
  }
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    if (obj && typeof obj === 'object') {
      if (obj.class && typeof obj.class !== 'string') {
        return { isValid: false, reason: `Malformed class descriptor detected at batch index ${i}.` };
      }
    }
  }
  return { isValid: true };
}

export function createWeaviateBatchQuarantineRule(): SentinelRule {
  return {
    id: 'rag-weaviate-batch-quarantine',
    name: 'Quarantine and Validate Weaviate Batch Object Upserts',
    category: 'custom',
    priority: 935,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const isBatch = ctx.toolName.includes('weaviate') && (ctx.toolName.includes('batch') || ctx.params?.objects !== undefined);
      if (!isBatch) return null;
      const objects = ctx.params?.objects;
      const inspection = inspectWeaviateBatchObjects(objects);
      if (!inspection.isValid) {
        return {
          ruleId: 'rag-weaviate-batch-quarantine',
          ruleName: 'Quarantine and Validate Weaviate Batch Object Upserts',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: inspection.reason || 'Malformed batch payload detected.',
        };
      }
      return null;
    }
  };
}
