/**
 * AgentSentinel - Soroban Read Bytes Memory Ceiling Guard
 * Restricts maximum contract storage bytes loaded into memory during execution
 * to prevent excessive read fees and out-of-memory transaction aborts.
 */
import { SentinelRule } from '../types.js';
export interface ReadBytesConfig {
    maxReadBytes?: number;
}
export declare function createReadBytesCeilingRule(config?: ReadBytesConfig): SentinelRule;
//# sourceMappingURL=read_bytes_ceiling.d.ts.map