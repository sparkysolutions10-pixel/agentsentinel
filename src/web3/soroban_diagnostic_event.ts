/**
 * AgentSentinel - Soroban Contract Diagnostic Event Parser and Filter
 * Parses diagnostic events emitted during Soroban contract simulation and execution
 * to extract structured error codes, revert reasons, and panic triggers.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanDiagnosticConfig {
  blockOnPanic?: boolean; // default: true
}

export function createSorobanDiagnosticEventParserRule(config: SorobanDiagnosticConfig = {}): SentinelRule {
  const blockOnPanic = config.blockOnPanic ?? true;

  return {
    id: 'soroban-diagnostic-event-parser',
    name: 'Soroban Diagnostic Event Parser',
    category: 'custom' as ToolCategory,
    priority: 86,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('diagnostic') && !tool.includes('event')) {
        return null;
      }

      const params = context.params || {};
      const events: any[] = Array.isArray(params.diagnosticEvents || params.events) ? (params.diagnosticEvents || params.events) : [];

      for (const ev of events) {
        const topics: string[] = Array.isArray(ev.topics) ? ev.topics.map((t: any) => String(t)) : [];
        const isPanic = topics.some((t: string) => t.toLowerCase().includes('panic') || t.toLowerCase().includes('error') || t.toLowerCase().includes('assert'));
        const revertReason = ev.data || ev.revertReason || ev.message || 'Unknown panic';

        if (isPanic) {
          return {
            ruleId: 'soroban-diagnostic-event-parser',
            ruleName: 'Soroban Diagnostic Event Parser',
            severity: 'critical',
            verdict: blockOnPanic ? Verdict.BLOCK : Verdict.CONFIRM,
            reason: `Contract execution triggered panic or assertion failure: "${revertReason}".`,
            detectedPattern: `CONTRACT_PANIC_DIAGNOSTIC:${revertReason}`,
          };
        }
      }

      return null;
    }
  };
}
