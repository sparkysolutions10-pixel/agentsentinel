import { describe, it, expect } from 'vitest';
import { ShellPipeNetworkBashBlocker } from '../src/ast/shell_pipe_network_bash_blocker.js';

describe('ShellPipeNetworkBashBlocker Invariant Suite (#1854)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ShellPipeNetworkBashBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SHELL_PIPE_NETWORK_BASH_BLOCKER');
    expect(ShellPipeNetworkBashBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ShellPipeNetworkBashBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ShellPipeNetworkBashBlocker.validate('git status && npm run test')).toBe(true);
  });
});
