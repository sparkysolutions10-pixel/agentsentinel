/**
 * AgentSentinel - Forbidden WASM Import and Host Function Detector
 * Ensures Soroban smart contract binaries only import authorized host modules ('env' or 'soroban')
 * and intercepts forbidden OS/filesystem imports (e.g. wasi, libc, system).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanWasmImportConfig {
  allowedModules?: string[];
}

const DEFAULT_ALLOWED_MODULES = new Set(['env', 'soroban', 'host']);

export function createSorobanWasmImportDetectorRule(config: SorobanWasmImportConfig = {}): SentinelRule {
  const allowed = new Set((config.allowedModules || Array.from(DEFAULT_ALLOWED_MODULES)).map(m => m.toLowerCase()));

  return {
    id: 'soroban-wasm-import-detector',
    name: 'Soroban Forbidden WASM Import Detector',
    category: 'custom' as ToolCategory,
    priority: 92,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('wasm') && !tool.includes('import') && !tool.includes('contract')) {
        return null;
      }

      const params = context.params || {};
      const imports: string[] = Array.isArray(params.imports || params.importedModules) ? (params.imports || params.importedModules) : [];

      for (const mod of imports) {
        const modName = String(mod).toLowerCase().split('::')[0].split('.')[0].trim();
        if (modName && !allowed.has(modName)) {
          return {
            ruleId: 'soroban-wasm-import-detector',
            ruleName: 'Soroban Forbidden WASM Import Detector',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `WASM contract imports unauthorized module "${modName}". Only standard Soroban environment modules (${Array.from(allowed).join(', ')}) are permitted.`,
            detectedPattern: `FORBIDDEN_WASM_IMPORT:${modName}`,
          };
        }
      }

      return null;
    }
  };
}
