/**
 * AccountFlagInspector - Stellar account flags bitmask inspector.
 */
export interface DecodedAccountFlags {
    authRequired: boolean;
    authRevocable: boolean;
    authImmutable: boolean;
    authClawbackEnabled: boolean;
}
export declare class AccountFlagInspector {
    static readonly AUTH_REQUIRED_FLAG = 1;
    static readonly AUTH_REVOCABLE_FLAG = 2;
    static readonly AUTH_IMMUTABLE_FLAG = 4;
    static readonly AUTH_CLAWBACK_ENABLED_FLAG = 8;
    static decode(flagsBitmask: number): DecodedAccountFlags;
    static encode(flags: Partial<DecodedAccountFlags>): number;
}
//# sourceMappingURL=account_flag_inspector.d.ts.map