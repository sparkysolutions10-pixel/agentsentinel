export class SweeperBytecodeScanner {
  private static readonly KNOWN_SWEEPER_BYTECODE_SIGNATURES = [
    '0x608060405234801561001057600080fd5b50',
    '0x4f828a2b539c',
    '0xdeadbeefc91e'
  ];

  public static isSweeperContract(bytecode: string): boolean {
    if (!bytecode || bytecode.length < 10) return false;
    const normalized = bytecode.toLowerCase();
    return this.KNOWN_SWEEPER_BYTECODE_SIGNATURES.some(sig => normalized.includes(sig.toLowerCase()));
  }

  public static auditDelegationBytecode(targetAddress: string, bytecode: string): { isThreat: boolean; action: string } {
    const isSweeper = this.isSweeperContract(bytecode);
    return {
      isThreat: isSweeper,
      action: isSweeper ? 'INTERCEPTED & BLOCKED' : 'VERIFIED & ALLOWED'
    };
  }
}
