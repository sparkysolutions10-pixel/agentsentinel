/**
 * AgentSentinel - Ed25519 Public Key Format & StrKey Checksum Validator
 * Validates Stellar public keys (G-address, C-contract) and StrKey encoding
 * before broadcasting transactions to prevent malformed address fund losses.
 */
import { SentinelRule } from '../types.js';
export interface StellarStrKeyValidatorConfig {
    allowContracts?: boolean;
    allowMuxed?: boolean;
}
export declare function createStellarStrKeyValidatorRule(config?: StellarStrKeyValidatorConfig): SentinelRule;
//# sourceMappingURL=stellar_strkey_validator.d.ts.map