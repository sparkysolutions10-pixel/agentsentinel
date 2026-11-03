import { describe, it, expect } from 'vitest';
import { Web3RpcPayloadTamperGuard } from '../src/web3/web3_rpc_payload_tamper_guard.js';

describe('Web3RpcPayloadTamperGuard Invariant Suite (#1803)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = Web3RpcPayloadTamperGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_WEB3_RPC_PAYLOAD_TAMPER_GUARD');
    expect(Web3RpcPayloadTamperGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = Web3RpcPayloadTamperGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(Web3RpcPayloadTamperGuard.validate('git status && npm run test')).toBe(true);
  });
});
