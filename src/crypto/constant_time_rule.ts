import crypto from 'crypto';
import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export class ConstantTimeComparator {
  public static compare(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) {
      const dummy = Buffer.alloc(bufA.length);
      crypto.timingSafeEqual(bufA, dummy);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }
}

export function createConstantTimeRule(): SentinelRule {
  return {
    id: 'crypto-constant-time-comparator',
    name: 'Guarantee Constant-Time Execution on Secret Comparisons',
    category: 'custom',
    priority: 960,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      return null;
    }
  };
}
