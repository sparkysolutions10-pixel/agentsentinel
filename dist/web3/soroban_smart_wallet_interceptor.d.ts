/**
 * AgentSentinel - Custom Account Contract (Smart Wallet) Signature Interceptor
 * Intercepts custom smart account authentications (__check_auth), verifying
 * Passkey / WebAuthn signature payloads and origin domain bindings.
 */
import { SentinelRule } from '../types.js';
export interface SorobanSmartWalletConfig {
    allowedOrigins?: string[];
    requireWebAuthnClientData?: boolean;
}
export declare function createSorobanSmartWalletInterceptorRule(config?: SorobanSmartWalletConfig): SentinelRule;
//# sourceMappingURL=soroban_smart_wallet_interceptor.d.ts.map