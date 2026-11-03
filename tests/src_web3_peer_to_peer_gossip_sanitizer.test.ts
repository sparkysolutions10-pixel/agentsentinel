import { describe, it, expect } from 'vitest';
import { PeerToPeerGossipSanitizer } from '../src/web3/peer_to_peer_gossip_sanitizer.js';

describe('PeerToPeerGossipSanitizer Invariant Suite (#1786)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PeerToPeerGossipSanitizer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PEER_TO_PEER_GOSSIP_SANITIZER');
    expect(PeerToPeerGossipSanitizer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PeerToPeerGossipSanitizer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PeerToPeerGossipSanitizer.validate('git status && npm run test')).toBe(true);
  });
});
