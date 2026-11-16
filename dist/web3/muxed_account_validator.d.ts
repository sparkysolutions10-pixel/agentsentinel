/**
 * AgentSentinel - SEP-23 Muxed Account (M-Address) Validator
 * Validates SEP-23 multiplexed addresses and enforces 64-bit ID bounds
 * to prevent customer fund misdirection and integer overflow exploits.
 */
import { SentinelRule } from '../types.js';
export declare const MAX_UINT64: bigint;
export declare function createMuxedAccountValidatorRule(): SentinelRule;
//# sourceMappingURL=muxed_account_validator.d.ts.map