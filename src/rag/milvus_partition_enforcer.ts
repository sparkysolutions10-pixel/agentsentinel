import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface MilvusPartitionOptions {
  enforceTenantPartition?: boolean;
}

export function inspectMilvusPartition(params: Record<string, any>): { isValid: boolean; reason?: string } {
  if (!params) return { isValid: true };
  const partitionName = params.partition_name ?? params.partitionName ?? params.partition;
  if (!partitionName || (typeof partitionName === 'string' && partitionName.trim().length === 0)) {
    return { isValid: false, reason: 'Milvus vector operations must explicitly specify a partition key for multi-tenant isolation.' };
  }
  return { isValid: true };
}

export function createMilvusPartitionKeyEnforcerRule(options: MilvusPartitionOptions = {}): SentinelRule {
  return {
    id: 'rag-milvus-partition-enforcer',
    name: 'Enforce Explicit Milvus Partition Keys for Multi-Tenant Isolation',
    category: 'custom',
    priority: 940,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const isMilvus = ctx.toolName.toLowerCase().includes('milvus') || ctx.params?.client === 'milvus';
      if (!isMilvus) return null;
      const isReadWrite = ctx.toolName.includes('query') || ctx.toolName.includes('search') || ctx.toolName.includes('insert');
      if (!isReadWrite) return null;

      const inspection = inspectMilvusPartition(ctx.params);
      if (!inspection.isValid) {
        return {
          ruleId: 'rag-milvus-partition-enforcer',
          ruleName: 'Enforce Explicit Milvus Partition Keys for Multi-Tenant Isolation',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: inspection.reason || 'Missing required partition key.',
        };
      }
      return null;
    }
  };
}
