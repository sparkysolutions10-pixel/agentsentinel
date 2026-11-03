import { describe, it, expect } from 'vitest';
import { SolidityAssemblyBlockDisallow } from '../src/web3/solidity_assembly_block_disallow.js';

describe('SolidityAssemblyBlockDisallow Invariant Suite (#1776)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SolidityAssemblyBlockDisallow.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SOLIDITY_ASSEMBLY_BLOCK_DISALLOW');
    expect(SolidityAssemblyBlockDisallow.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SolidityAssemblyBlockDisallow.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SolidityAssemblyBlockDisallow.validate('git status && npm run test')).toBe(true);
  });
});
