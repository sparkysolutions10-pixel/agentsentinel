/**
 * AgentSentinel - Concurrent Tool Lock Manager
 * Implements in-memory mutex locking keyed by account address / resource URI
 * to prevent concurrent parallel tool invocations from causing race conditions.
 */
export class ConcurrentToolLockManager {
    activeLocks = new Map();
    acquireLock(resourceKey, ownerId, options = {}) {
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
    releaseLock(resourceKey, ownerId) {
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
    isLocked(resourceKey) {
        const existing = this.activeLocks.get(resourceKey);
        if (!existing)
            return false;
        return existing.expiresAt > Date.now();
    }
}
//# sourceMappingURL=concurrent_tool_lock.js.map