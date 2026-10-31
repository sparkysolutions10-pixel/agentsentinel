/**
 * AgentSentinel - Recursive Callback Honeypot Detector
 * Detects contracts attempting boomerang callbacks into the invoking agent
 * or wallet address with altered parameters, trapping agents into honeypot drain loops.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanCallbackConfig {
  agentAddress?: string;
  disallowSelfCallbacks?: boolean;
}

export function createSorobanCallbackDetectorRule(config: SorobanCallbackConfig = {}): SentinelRule {
  const agentAddr = config.agentAddress ? config.agentAddress.trim() : '';
  const disallowSelf = config.disallowSelfCallbacks ?? true;

  return {
    id: 'soroban-callback-detector',
    name: 'Soroban Callback Honeypot Detector',
    category: 'custom' as ToolCategory,
    priority: 73,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('contract')) {
        return null;
      }

      const params = context.params || {};
      const callbackTarget = String(params.callbackRecipient || params.callbackAddress || params.callback || '').trim();
      const fn = String(params.function || params.method || '').toLowerCase();

      // Check if callback targets the calling agent/wallet
      const isCallbackHook = fn.includes('callback') || fn.includes('hook') || fn.includes('notify') || Boolean(params.isCallback);

      if (disallowSelf && isCallbackHook) {
        if (agentAddr && callbackTarget === agentAddr) {
          return {
            ruleId: 'soroban-callback-detector',
            ruleName: 'Soroban Callback Honeypot Detector',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Recursive boomerang callback detected: contract attempted invocation callback directly targeting caller "${agentAddr}". Potential honeypot drain loop.`,
            detectedPattern: `BOOMERANG_CALLBACK_HONEYPOT:${agentAddr}`,
          };
        }
      }

      return null;
    }
  };
}
