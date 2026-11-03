import { describe, it, expect } from 'vitest';
import { CrossChainBridgeMessageVerifier } from '../src/web3/cross_chain_bridge_message_verifier.js';

describe('CrossChainBridgeMessageVerifier Invariant Suite (#1760)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CrossChainBridgeMessageVerifier.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CROSS_CHAIN_BRIDGE_MESSAGE_VERIFIER');
    expect(CrossChainBridgeMessageVerifier.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CrossChainBridgeMessageVerifier.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CrossChainBridgeMessageVerifier.validate('git status && npm run test')).toBe(true);
  });
});
