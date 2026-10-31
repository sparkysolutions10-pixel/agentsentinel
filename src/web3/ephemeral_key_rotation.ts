/**
 * AgentSentinel - Ephemeral Session Key Rotation Manager
 * Monitors transaction count and operational lifetime of ephemeral bot signing keys
 * to enforce mandatory periodic key rotation and limit exposure windows.
 */

export interface KeyRotationPolicy {
  maxTransactions?: number; // default: 100
  maxLifetimeMs?: number;   // default: 24 hours (86,400,000 ms)
}

export class EphemeralKeyRotationManager {
  private maxTx: number;
  private maxLifetime: number;
  private keyRecords: Map<string, { createdAt: number; txCount: number }> = new Map();

  constructor(policy: KeyRotationPolicy = {}) {
    this.maxTx = policy.maxTransactions ?? 100;
    this.maxLifetime = policy.maxLifetimeMs ?? 86400000;
  }

  public registerKey(keyId: string, timestamp = Date.now()): void {
    this.keyRecords.set(keyId, { createdAt: timestamp, txCount: 0 });
  }

  public recordTransaction(keyId: string): void {
    const record = this.keyRecords.get(keyId);
    if (record) {
      record.txCount++;
    }
  }

  public isRotationRequired(keyId: string, now = Date.now()): { required: boolean; reason?: string } {
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
