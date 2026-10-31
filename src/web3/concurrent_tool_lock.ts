/**
 * AgentSentinel - Concurrent Tool Lock Manager
 * Implements in-memory mutex locking keyed by account address / resource URI
 * to prevent concurrent parallel tool invocations from causing race conditions.
 */

export interface LockOptions {
  timeoutMs?: number; // default: 5000ms
}

export class ConcurrentToolLockManager {
  private activeLocks: Map<string, { owner: string; expiresAt: number }> = new Map();

  public acquireLock(resourceKey: string, ownerId: string, options: LockOptions = {}): boolean {
    const now = Date.now();
    const timeout = options.timeoutMs ?? 5000;
    const existing = this.activeLocks.get(resourceKey);

    if (existing && existing.expiresAt > now) {
      if (existing.owner === ownerId) {
        // Re-entrant lock extension
        existing.expiresAt = now + timeout;
        return true;
      }
      return false; // Locked by another worker
    }

    this.activeLocks.set(resourceKey, {
      owner: ownerId,
      expiresAt: now + timeout
    });
    return true;
  }

  public releaseLock(resourceKey: string, ownerId: string): boolean {
    const existing = this.activeLocks.get(resourceKey);
    if (!existing) {
      return false;
    }

    if (existing.owner === ownerId) {
      this.activeLocks.delete(resourceKey);
      return true;
    }

    return false; // Cannot release lock owned by someone else
  }

  public isLocked(resourceKey: string): boolean {
    const existing = this.activeLocks.get(resourceKey);
    if (!existing) return false;
    return existing.expiresAt > Date.now();
  }
}
