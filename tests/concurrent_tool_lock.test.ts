import { describe, it, expect } from 'vitest';
import { ConcurrentToolLockManager } from '../src/web3/concurrent_tool_lock.js';

describe('ConcurrentToolLockManager', () => {
  it('acquires and releases lock successfully for authorized owner', () => {
    const manager = new ConcurrentToolLockManager();
    const key = 'account:GBBD67IFDDNVVUWW7AUXCXP22OHGDBC3TVN';

    const acquired = manager.acquireLock(key, 'agent_1');
    expect(acquired).toBe(true);
    expect(manager.isLocked(key)).toBe(true);

    const released = manager.releaseLock(key, 'agent_1');
    expect(released).toBe(true);
    expect(manager.isLocked(key)).toBe(false);
  });

  it('rejects concurrent lock acquisition by a second agent', () => {
    const manager = new ConcurrentToolLockManager();
    const key = 'account:GBBD67IFDDNVVUWW7AUXCXP22OHGDBC3TVN';

    manager.acquireLock(key, 'agent_1');
    const secondAgentAttempt = manager.acquireLock(key, 'agent_2');
    expect(secondAgentAttempt).toBe(false);

    // Agent 2 cannot release Agent 1's lock
    const illegalRelease = manager.releaseLock(key, 'agent_2');
    expect(illegalRelease).toBe(false);
    expect(manager.isLocked(key)).toBe(true);
  });

  it('allows lock re-entry by the same owner', () => {
    const manager = new ConcurrentToolLockManager();
    const key = 'account:GBBD67IFDDNVVUWW7AUXCXP22OHGDBC3TVN';

    expect(manager.acquireLock(key, 'agent_1')).toBe(true);
    expect(manager.acquireLock(key, 'agent_1')).toBe(true); // Re-entry
  });
});
