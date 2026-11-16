/**
 * AgentSentinel - Concurrent Tool Lock Manager
 * Implements in-memory mutex locking keyed by account address / resource URI
 * to prevent concurrent parallel tool invocations from causing race conditions.
 */
export interface LockOptions {
    timeoutMs?: number;
}
export declare class ConcurrentToolLockManager {
    private activeLocks;
    acquireLock(resourceKey: string, ownerId: string, options?: LockOptions): boolean;
    releaseLock(resourceKey: string, ownerId: string): boolean;
    isLocked(resourceKey: string): boolean;
}
//# sourceMappingURL=concurrent_tool_lock.d.ts.map