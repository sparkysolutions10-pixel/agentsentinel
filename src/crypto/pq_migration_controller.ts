import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export class PostQuantumMigrationController {
  public static isAlgorithmAllowed(algorithm: string, keySize: number): boolean {
    const algo = algorithm.toUpperCase();
    if (algo.includes('RSA') && keySize < 3072) return false;
    if (algo.includes('ECC') && keySize < 256) return false;
    return true;
  }
}

export function createPqMigrationRule(): SentinelRule {
  return {
    id: 'crypto-pq-migration-controller',
    name: 'Deprecate Weak Classical Key Lengths in Production',
    category: 'custom',
    priority: 960,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const algo = ctx.params?.algorithm;
      const keySize = ctx.params?.key_size ?? ctx.params?.keySize;
      if (algo && keySize) {
        if (!PostQuantumMigrationController.isAlgorithmAllowed(algo, keySize)) {
          return {
            ruleId: 'crypto-pq-migration-controller',
            ruleName: 'Deprecate Weak Classical Key Lengths in Production',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Deprecated cryptographic key length: ${algo} with ${keySize} bits is prohibited. Use post-quantum or minimum RSA-3072.`,
            detectedPattern: `${algo}-${keySize}`
          };
        }
      }
      return null;
    }
  };
}
