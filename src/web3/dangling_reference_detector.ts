/**
 * AgentSentinel - Dangling Contract Storage Reference Detector
 * Identifies orphan storage pointers targeting destroyed contracts or uninitialized addresses.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export function createDanglingReferenceRule(): SentinelRule {
  return {
    id: 'dangling-contract-reference-detector',
    name: 'Dangling Contract Storage Reference Detector',
    category: 'custom' as ToolCategory,
    priority: 80,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const params = context.params || {};
      const targetContract = String(params.targetContract || params.destinationContract || '').toUpperCase();

      if (targetContract) {
        if (targetContract.startsWith('C') && targetContract.includes('00000000000000000000000000000000')) {
          return {
            ruleId: 'dangling-contract-reference-detector',
            ruleName: 'Dangling Contract Storage Reference Detector',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Dangling contract reference detected: target "${targetContract}" is a null/uninitialized contract pointer.`,
            detectedPattern: `NULL_CONTRACT_POINTER:${targetContract}`
          };
        }
      }

      return null;
    }
  };
}
