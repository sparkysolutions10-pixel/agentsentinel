import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { loadAllWeb3Rules } from '../src/web3/master_web3_bundle.js';

describe('AgentSentinelMasterWeb3Bundle', () => {
  it('loads the full master suite of security rules into SentinelEngine', () => {
    const engine = new SentinelEngine();
    loadAllWeb3Rules(engine);

    const rules = engine.registry.getAll();
    expect(rules.length).toBeGreaterThanOrEqual(20);
    expect(rules.some((r: any) => r.id === 'bridge-lock-proof-validator')).toBe(true);
    expect(rules.some((r: any) => r.id === 'ofac-sanctions-address-filter')).toBe(true);
    expect(rules.some((r: any) => r.id === 'ed25519-malleability-scrubber')).toBe(true);
  });
});
