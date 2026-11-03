import { describe, it, expect } from 'vitest';
import { SeccompBpfSyscallFilter } from '../src/sandbox/seccomp_bpf_syscall_filter.js';

describe('SeccompBpfSyscallFilter Invariant Suite (#2055)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SeccompBpfSyscallFilter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SECCOMP_BPF_SYSCALL_FILTER');
    expect(SeccompBpfSyscallFilter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SeccompBpfSyscallFilter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SeccompBpfSyscallFilter.validate('git status && npm run test')).toBe(true);
  });
});
