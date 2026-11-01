import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createDecompressionBombGuardRule(maxRatio: number = 100): SentinelRule {
  return {
    id: 'rag-decompression-bomb-guard',
    name: 'Prevent Document Decompression Bomb Expansion Attacks',
    category: 'custom',
    priority: 930,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const compressedSize = ctx.params?.compressedBytes || ctx.params?.archiveSize;
      const uncompressedSize = ctx.params?.uncompressedBytes || ctx.params?.extractedSize;
      if (typeof compressedSize === 'number' && typeof uncompressedSize === 'number' && compressedSize > 0) {
        const ratio = uncompressedSize / compressedSize;
        if (ratio > maxRatio) {
          return {
            ruleId: 'rag-decompression-bomb-guard',
            ruleName: 'Prevent Document Decompression Bomb Expansion Attacks',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Decompression ratio ${ratio.toFixed(1)}:1 exceeds safety threshold of ${maxRatio}:1.`,
            detectedPattern: 'zip-bomb-expansion',
          };
        }
      }
      return null;
    }
  };
}
