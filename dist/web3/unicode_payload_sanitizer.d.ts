/**
 * AgentSentinel - Unicode Payload Sanitizer
 * Scans transaction memos, parameters, and contract call arguments for
 * invisible zero-width spaces, directional override codes, and homoglyph exploits.
 */
import { SentinelRule } from '../types.js';
export declare function createUnicodePayloadSanitizerRule(): SentinelRule;
//# sourceMappingURL=unicode_payload_sanitizer.d.ts.map