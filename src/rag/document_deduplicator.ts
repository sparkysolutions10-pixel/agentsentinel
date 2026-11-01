import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createDocumentDeduplicatorRule(): SentinelRule {
  const seenHashes = new Set<string>();

  return {
    id: 'rag-document-deduplicator',
    name: 'Deduplicate Redundant Document Chunk Hashes',
    category: 'custom',
    priority: 830,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const hash = ctx.params?.hash || ctx.params?.contentHash || ctx.params?.sha256;
      if (typeof hash === 'string') {
        if (seenHashes.has(hash)) {
          return {
            ruleId: 'rag-document-deduplicator',
            ruleName: 'Deduplicate Redundant Document Chunk Hashes',
            severity: 'low',
            verdict: Verdict.BLOCK,
            reason: `Duplicate document content hash ${hash} already ingested. Dropping redundant chunk.`,
            detectedPattern: `duplicate-hash=${hash}`,
          };
        }
        seenHashes.add(hash);
      }
      return null;
    }
  };
}
