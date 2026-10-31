/**
 * AgentSentinel - WASM Bytecode Header and Magic Number Validator
 * Inspects installed or deployed WASM contract binaries to verify the standard
 * WebAssembly magic header (\0asm / 0x00 0x61 0x73 0x6d) and version 1.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanWasmHeaderConfig {
  requireVersionOne?: boolean; // default: true
}

// \0asm (0x00, 0x61, 0x73, 0x6d) in hex: "0061736d"
const WASM_MAGIC_HEX = '0061736d';
const WASM_VERSION_1_HEX = '01000000';

export function createSorobanWasmHeaderValidatorRule(config: SorobanWasmHeaderConfig = {}): SentinelRule {
  const requireV1 = config.requireVersionOne ?? true;

  return {
    id: 'soroban-wasm-header-validator',
    name: 'Soroban WASM Bytecode Header Validator',
    category: 'custom' as ToolCategory,
    priority: 90,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('wasm') && !tool.includes('deploy') && !tool.includes('install') && !tool.includes('contract')) {
        return null;
      }

      const params = context.params || {};
      const bytecodeHex = String(params.bytecodeHex || params.wasmHex || params.bytecode || '').replace(/^0x/i, '').toLowerCase();
      if (!bytecodeHex || bytecodeHex.length < 8) {
        return null;
      }

      const magic = bytecodeHex.substring(0, 8);
      if (magic !== WASM_MAGIC_HEX) {
        return {
          ruleId: 'soroban-wasm-header-validator',
          ruleName: 'Soroban WASM Bytecode Header Validator',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Invalid WebAssembly magic header (received: 0x${magic}, expected: 0x${WASM_MAGIC_HEX} / \0asm). Corrupted or forged bytecode.`,
          detectedPattern: `INVALID_WASM_MAGIC:${magic}`,
        };
      }

      if (requireV1 && bytecodeHex.length >= 16) {
        const version = bytecodeHex.substring(8, 16);
        if (version !== WASM_VERSION_1_HEX) {
          return {
            ruleId: 'soroban-wasm-header-validator',
            ruleName: 'Soroban WASM Bytecode Header Validator',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Unsupported WebAssembly version (received: 0x${version}, expected version 1: 0x${WASM_VERSION_1_HEX}).`,
            detectedPattern: `UNSUPPORTED_WASM_VERSION:${version}`,
          };
        }
      }

      return null;
    }
  };
}
