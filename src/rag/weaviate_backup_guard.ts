import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createWeaviateBackupIntegrityRule(): SentinelRule {
  return {
    id: 'rag-weaviate-backup-guard',
    name: 'Verify Cryptographic Integrity on Weaviate Backup and Restore',
    category: 'custom',
    priority: 950,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const isRestore = ctx.toolName.includes('weaviate') && (ctx.toolName.includes('restore') || ctx.params?.action === 'restore');
      if (!isRestore) return null;
      const checksum = ctx.params?.checksum ?? ctx.params?.sha256;
      if (!checksum || (typeof checksum === 'string' && checksum.length < 32)) {
        return {
          ruleId: 'rag-weaviate-backup-guard',
          ruleName: 'Verify Cryptographic Integrity on Weaviate Backup and Restore',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Restoring Weaviate backup archives without a verified SHA-256 cryptographic checksum is prohibited.',
          detectedPattern: 'missing_checksum',
        };
      }
      return null;
    }
  };
}
