/**
 * AgentSentinel - Anomalous Contract Event Emit Rate Detector
 * Intercepts high-frequency event spam (e.g. hundreds of events emitted in a single transaction)
 * designed to exhaust indexer memory, disrupt RPC nodes, or obfuscate exploit calls.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanEventRateConfig {
  maxEventsPerTransaction?: number; // default: 20
}

export function createSorobanEventRateDetectorRule(config: SorobanEventRateConfig = {}): SentinelRule {
  const maxEvents = config.maxEventsPerTransaction ?? 20;

  return {
    id: 'soroban-event-rate-detector',
    name: 'Soroban Event Rate Spammer Detector',
    category: 'custom' as ToolCategory,
    priority: 81,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('event') && !tool.includes('soroban') && !tool.includes('tx')) {
        return null;
      }

      const params = context.params || {};
      const eventsCount = Number(params.eventsCount ?? (Array.isArray(params.events) ? params.events.length : 0));

      if (eventsCount > maxEvents) {
        return {
          ruleId: 'soroban-event-rate-detector',
          ruleName: 'Soroban Event Rate Spammer Detector',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Transaction emits an anomalous number of events (${eventsCount} > limit ${maxEvents}). Potential indexer DOS or obfuscation attack.`,
          detectedPattern: `ANOMALOUS_EVENT_RATE:${eventsCount}>${maxEvents}`,
        };
      }

      return null;
    }
  };
}
