/**
 * AgentSentinel - Soroban Read-Write Footprint Memory Conflict Guard
 * Inspects Soroban ledger footprints to prevent concurrent write-write
 * collisions, invalid self-collisions, and ledger footprint capacity exhaustion.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanFootprintGuardConfig {
  maxFootprintKeys?: number;
  allowReadConcurrency?: boolean;
  activeLocks?: Set<string> | string[];
}

export function createSorobanFootprintGuardRule(config: SorobanFootprintGuardConfig = {}): SentinelRule {
  const maxKeys = config.maxFootprintKeys ?? 64;
  const activeWriteLocks = new Set<string>(
    Array.isArray(config.activeLocks) ? config.activeLocks : (config.activeLocks ? Array.from(config.activeLocks) : [])
  );

  return {
    id: 'soroban-footprint-guard',
    name: 'Soroban Footprint Conflict Guard',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      // Only inspect Web3 / Soroban / Stellar tools
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('contract')) {
        return null;
      }

      const params = context.params || {};
      
      // Extract readWrite and readOnly sets from various tool parameter schemas
      const footprint = params.footprint || {};
      const readWrite: string[] = [
        ...(Array.isArray(footprint.readWrite) ? footprint.readWrite : []),
        ...(Array.isArray(params.readWrite) ? params.readWrite : []),
        ...(Array.isArray(params.writeKeys) ? params.writeKeys : []),
      ].map(k => String(k).trim()).filter(Boolean);

      const readOnly: string[] = [
        ...(Array.isArray(footprint.readOnly) ? footprint.readOnly : []),
        ...(Array.isArray(params.readOnly) ? params.readOnly : []),
        ...(Array.isArray(params.readKeys) ? params.readKeys : []),
      ].map(k => String(k).trim()).filter(Boolean);

      const totalKeys = readWrite.length + readOnly.length;

      // 1. Check max footprint capacity limit (Soroban ledger limit)
      if (totalKeys > maxKeys) {
        return {
          ruleId: 'soroban-footprint-guard',
          ruleName: 'Soroban Footprint Conflict Guard',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Soroban ledger footprint key count (${totalKeys}) exceeds maximum allowed capacity (${maxKeys} keys).`,
          detectedPattern: `FOOTPRINT_CAPACITY_EXCEEDED:${totalKeys}>${maxKeys}`,
        };
      }

      // 2. Check internal footprint consistency (key cannot appear in both readOnly and readWrite)
      const readOnlySet = new Set(readOnly);
      for (const rwKey of readWrite) {
        if (readOnlySet.has(rwKey)) {
          return {
            ruleId: 'soroban-footprint-guard',
            ruleName: 'Soroban Footprint Conflict Guard',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Invalid Soroban footprint: key "${rwKey}" appears in both readOnly and readWrite sets.`,
            detectedPattern: `FOOTPRINT_SELF_COLLISION:${rwKey}`,
          };
        }
      }

      // 3. Check for conflict with active locks (concurrent write conflicts)
      for (const rwKey of readWrite) {
        if (activeWriteLocks.has(rwKey)) {
          return {
            ruleId: 'soroban-footprint-guard',
            ruleName: 'Soroban Footprint Conflict Guard',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Footprint write lock conflict: key "${rwKey}" is currently locked by a concurrent transaction.`,
            detectedPattern: `FOOTPRINT_LOCK_CONFLICT:${rwKey}`,
          };
        }
      }

      return null;
    }
  };
}
