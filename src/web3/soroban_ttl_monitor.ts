/**
 * AgentSentinel - Soroban State Archival TTL Expiration & Extension Monitor
 * Tracks live ledger entry TTL and prevents contract execution failures
 * caused by expired or impending state archival in Soroban persistent storage.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanTtlMonitorConfig {
  minTtlLedgers?: number; // default: 1000 ledgers (~83 minutes at 5s/ledger)
  warningTtlLedgers?: number; // default: 10000 ledgers
}

export function createSorobanTtlMonitorRule(config: SorobanTtlMonitorConfig = {}): SentinelRule {
  const minTtl = config.minTtlLedgers ?? 1000;

  return {
    id: 'soroban-ttl-monitor',
    name: 'Soroban State Archival TTL Monitor',
    category: 'custom' as ToolCategory,
    priority: 84,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('contract')) {
        return null;
      }

      const params = context.params || {};
      
      // If it is an explicit TTL extension or footprint restore operation, allow it cleanly
      if (
        tool.includes('restore') ||
        tool.includes('extend_ttl') ||
        tool.includes('bump_ttl') ||
        params.operation === 'extendFootprintTtl' ||
        params.operation === 'restoreFootprint'
      ) {
        return null;
      }

      // Extract current live TTL from parameters
      let currentTtl: number | null = null;
      if (typeof params.ttlLedgers === 'number') {
        currentTtl = params.ttlLedgers;
      } else if (typeof params.liveUntilLedgerSeq === 'number' && typeof params.currentLedgerSeq === 'number') {
        currentTtl = params.liveUntilLedgerSeq - params.currentLedgerSeq;
      } else if (typeof params.ttl === 'number') {
        currentTtl = params.ttl;
      }

      if (currentTtl !== null) {
        if (currentTtl <= 0) {
          return {
            ruleId: 'soroban-ttl-monitor',
            ruleName: 'Soroban State Archival TTL Monitor',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Soroban contract state is already archived (TTL: ${currentTtl} ledgers). Execution will revert. Restore footprint before invoking.`,
            detectedPattern: `STATE_ARCHIVED_TTL:${currentTtl}<=0`,
          };
        }

        if (currentTtl < minTtl) {
          return {
            ruleId: 'soroban-ttl-monitor',
            ruleName: 'Soroban State Archival TTL Monitor',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Soroban storage TTL (${currentTtl} ledgers) is below safety minimum (${minTtl} ledgers). Impending state archival detected.`,
            detectedPattern: `TTL_SAFETY_DEFICIT:${currentTtl}<${minTtl}`,
          };
        }
      }

      return null;
    }
  };
}
