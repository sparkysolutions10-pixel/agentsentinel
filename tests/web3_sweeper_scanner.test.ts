import { describe, it, expect } from 'vitest';
import { SweeperBytecodeScanner } from '../src/web3/sweeper_scanner.js';

describe('Sweeper Bytecode Scanner (#1755)', () => {
  it('detects unverified sweeper contract patterns and flags threats', () => {
    const maliciousBytecode = '0x608060405234801561001057600080fd5b504f828a2b539c';
    expect(SweeperBytecodeScanner.isSweeperContract(maliciousBytecode)).toBe(true);

    const audit = SweeperBytecodeScanner.auditDelegationBytecode('0x4f82...', maliciousBytecode);
    expect(audit.isThreat).toBe(true);
    expect(audit.action).toBe('INTERCEPTED & BLOCKED');
  });

  it('permits verified non-sweeper contracts', () => {
    const safeBytecode = '0x608060405234801561001057600080fd5b50112233445566';
    expect(SweeperBytecodeScanner.isSweeperContract(safeBytecode)).toBe(false);

    const audit = SweeperBytecodeScanner.auditDelegationBytecode('0x1234...', safeBytecode);
    expect(audit.isThreat).toBe(false);
    expect(audit.action).toBe('VERIFIED & ALLOWED');
  });
});
