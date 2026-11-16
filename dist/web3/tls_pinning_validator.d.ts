/**
 * AgentSentinel - TLS Certificate Public Key Pinning Validator
 * Verifies SHA-256 SPKI fingerprints of TLS certificates on institutional RPC connections
 * to guarantee immunity against malicious MITM proxying and certificate authority compromise.
 */
import { SentinelRule } from '../types.js';
export interface TlsPinningConfig {
    pinnedFingerprints?: string[];
    enforceHttps?: boolean;
}
export declare function createTlsPinningRule(config?: TlsPinningConfig): SentinelRule;
//# sourceMappingURL=tls_pinning_validator.d.ts.map