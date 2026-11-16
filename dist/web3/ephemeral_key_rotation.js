/**
 * AgentSentinel - Ephemeral Session Key Rotation Manager
 * Monitors transaction count and operational lifetime of ephemeral bot signing keys
 * to enforce mandatory periodic key rotation and limit exposure windows.
 */
export class EphemeralKeyRotationManager {
    maxTx;
    maxLifetime;
    keyRecords = new Map();
    constructor(policy = {}) {
        this.maxTx = policy.maxTransactions ?? 100;
        this.maxLifetime = policy.maxLifetimeMs ?? 86400000;
    }
    registerKey(keyId, timestamp = Date.now()) {
        this.keyRecords.set(keyId, { createdAt: timestamp, txCount: 0 });
    }
    recordTransaction(keyId) {
        const record = this.keyRecords.get(keyId);
        if (record) {
            record.txCount++;
        }
    }
    isRotationRequired(keyId, now = Date.now()) {
        const record = this.keyRecords.get(keyId);
        if (!record) {
            return { required: true, reason: 'Key not registered' };
        }
        if (record.txCount >= this.maxTx) {
            return { required: true, reason: `Max transaction count reached (${record.txCount}/${this.maxTx})` };
        }
        if (now - record.createdAt >= this.maxLifetime) {
            return { required: true, reason: `Max key lifetime expired (${Math.floor((now - record.createdAt) / 1000)}s)` };
        }
        return { required: false };
    }
}
//# sourceMappingURL=ephemeral_key_rotation.js.map