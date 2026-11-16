/**
 * AgentSentinel - Ephemeral Session Key Rotation Manager
 * Monitors transaction count and operational lifetime of ephemeral bot signing keys
 * to enforce mandatory periodic key rotation and limit exposure windows.
 */
export interface KeyRotationPolicy {
    maxTransactions?: number;
    maxLifetimeMs?: number;
}
export declare class EphemeralKeyRotationManager {
    private maxTx;
    private maxLifetime;
    private keyRecords;
    constructor(policy?: KeyRotationPolicy);
    registerKey(keyId: string, timestamp?: number): void;
    recordTransaction(keyId: string): void;
    isRotationRequired(keyId: string, now?: number): {
        required: boolean;
        reason?: string;
    };
}
//# sourceMappingURL=ephemeral_key_rotation.d.ts.map