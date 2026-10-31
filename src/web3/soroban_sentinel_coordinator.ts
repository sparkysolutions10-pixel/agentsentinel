/**
 * AgentSentinel - Unified SorobanSentinel Orchestration Coordinator
 * Orchestrates multi-layered security evaluation across state rent, auth trees,
 * reentrancy, MEV slippage, SEP-41 token transfers, RPC failover, and WASM bytecodes.
 */

import { SentinelEngine } from '../index.js';
import { SentinelRule, ToolCallContext, EvaluationResult, Verdict } from '../types.js';
import { createSorobanFootprintGuardRule } from './soroban_footprint_guard.js';
import { createSorobanAuthTreeVerifierRule } from './soroban_auth_tree.js';
import { createSorobanReentrancyGuardRule } from './soroban_reentrancy_guard.js';
import { createSorobanSlippageEnforcerRule } from './soroban_slippage_enforcer.js';
import { createSorobanTokenTransferCeilingRule } from './soroban_token_ceiling.js';
import { createSorobanZeroAddressBurnInterceptorRule } from './soroban_zero_address_guard.js';

export interface SorobanSentinelCoordinatorConfig {
  engine?: SentinelEngine;
  rules?: SentinelRule[];
}

export class SorobanSentinelCoordinator {
  private engine: SentinelEngine;

  constructor(config: SorobanSentinelCoordinatorConfig = {}) {
    this.engine = config.engine || new SentinelEngine();
    
    // Register default core Web3 & Soroban security rules if engine is fresh
    const defaultRules: SentinelRule[] = config.rules || [
      createSorobanFootprintGuardRule(),
      createSorobanAuthTreeVerifierRule(),
      createSorobanReentrancyGuardRule(),
      createSorobanSlippageEnforcerRule(),
      createSorobanTokenTransferCeilingRule(),
      createSorobanZeroAddressBurnInterceptorRule(),
    ];

    for (const rule of defaultRules) {
      this.engine.registerRule(rule);
    }
  }

  public getEngine(): SentinelEngine {
    return this.engine;
  }

  public async evaluateToolCall(context: ToolCallContext): Promise<EvaluationResult> {
    return this.engine.evaluate(context);
  }
}
