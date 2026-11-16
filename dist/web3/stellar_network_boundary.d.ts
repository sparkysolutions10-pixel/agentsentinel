/**
 * AgentSentinel - Stellar Network Passphrase Boundary Validator
 * Strictly isolates Public Global Stellar Network from Testnet/Futurenet environments
 * to prevent automated test agents from executing transactions on live mainnet.
 */
import { SentinelRule } from '../types.js';
export interface StellarNetworkBoundaryConfig {
    allowedNetworkPassphrase?: string;
    environment?: 'production' | 'test' | 'staging';
}
export declare const PUBNET_PASSPHRASE = "Public Global Stellar Network ; September 2015";
export declare const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";
export declare const FUTURENET_PASSPHRASE = "Test SDF Future Network ; October 2022";
export declare function createStellarNetworkPassphraseValidatorRule(config?: StellarNetworkBoundaryConfig): SentinelRule;
//# sourceMappingURL=stellar_network_boundary.d.ts.map