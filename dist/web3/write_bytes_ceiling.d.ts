/**
 * AgentSentinel - Soroban Write Bytes Memory Ceiling Guard
 * Restricts maximum contract storage bytes written in a single transaction
 * to protect against state bloat and runaway storage rent charges.
 */
import { SentinelRule } from '../types.js';
export interface WriteBytesConfig {
    maxWriteBytes?: number;
}
export declare function createWriteBytesCeilingRule(config?: WriteBytesConfig): SentinelRule;
//# sourceMappingURL=write_bytes_ceiling.d.ts.map