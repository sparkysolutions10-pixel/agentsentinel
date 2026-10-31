/**
 * AgentSentinel - Master Web3 Bundle Loader
 * Exports the complete unified 100-rule suite for Soroban, Stellar, Cross-Chain Bridges,
 * and AI Agent Tool Security into a single 1-click SentinelEngine loader.
 */

import { SentinelEngine } from '../index.js';
import { loadSorobanStrictPreset } from './soroban_preset_loader.js';
import { createBridgeLockProofRule } from './bridge_lock_proof.js';
import { createBridgeMintInvariantRule } from './bridge_mint_invariant.js';
import { createBridgeRelayerSignatureRule } from './bridge_relayer_signatures.js';
import { createBridgeFinalityDelayRule } from './bridge_finality_delay.js';
import { createBridgeCircuitBreakerRule } from './bridge_emergency_circuit_breaker.js';
import { createEd25519MalleabilityRule } from './ed25519_malleability_scrubber.js';
import { createSequenceNumberGapRule } from './sequence_number_gap_detector.js';
import { createTransactionFeeBumpingRule } from './transaction_fee_bumping_guard.js';
import { createMuxedAccountValidatorRule } from './muxed_account_validator.js';
import { createSubentryCountRule } from './subentry_count_limiter.js';
import { createUnicodePayloadSanitizerRule } from './unicode_payload_sanitizer.js';
import { createCyclicToolGuardRule } from './cyclic_tool_guard.js';
import { createDnsRebindingShieldRule } from './dns_rebinding_shield.js';
import { createOfacSanctionsRule } from './ofac_sanctions_filter.js';
import { createStroopSurgeMultiplierRule } from './stroop_surge_multiplier.js';

export function loadAllWeb3Rules(engine: SentinelEngine): SentinelEngine {
  loadSorobanStrictPreset(engine);
  engine.registerRule(createBridgeLockProofRule());
  engine.registerRule(createBridgeMintInvariantRule());
  engine.registerRule(createBridgeRelayerSignatureRule());
  engine.registerRule(createBridgeFinalityDelayRule());
  engine.registerRule(createBridgeCircuitBreakerRule());
  engine.registerRule(createEd25519MalleabilityRule());
  engine.registerRule(createSequenceNumberGapRule());
  engine.registerRule(createTransactionFeeBumpingRule());
  engine.registerRule(createMuxedAccountValidatorRule());
  engine.registerRule(createSubentryCountRule());
  engine.registerRule(createUnicodePayloadSanitizerRule());
  engine.registerRule(createCyclicToolGuardRule());
  engine.registerRule(createDnsRebindingShieldRule());
  engine.registerRule(createOfacSanctionsRule());
  engine.registerRule(createStroopSurgeMultiplierRule());
  return engine;
}
