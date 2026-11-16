/**
 * AgentSentinel - Stellar Network Passphrase Guard
 * Enforces strict isolation between Testnet and Mainnet network passphrases
 * to prevent staging/test autonomous bots from submitting accidental transactions to Mainnet.
 */
import { SentinelRule } from '../types.js';
export declare const STELLAR_MAINNET_PASSPHRASE = "Public Global Stellar Network ; September 2015";
export declare const STELLAR_TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";
export declare const STELLAR_FUTURENET_PASSPHRASE = "Test SDF Future Network ; October 2022";
export interface NetworkPassphraseConfig {
    allowedNetwork: 'public' | 'testnet' | 'futurenet';
}
export declare function createNetworkPassphraseRule(config: NetworkPassphraseConfig): SentinelRule;
//# sourceMappingURL=network_passphrase_guard.d.ts.map