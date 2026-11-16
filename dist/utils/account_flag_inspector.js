/**
 * AccountFlagInspector - Stellar account flags bitmask inspector.
 */
export class AccountFlagInspector {
    static AUTH_REQUIRED_FLAG = 0x1;
    static AUTH_REVOCABLE_FLAG = 0x2;
    static AUTH_IMMUTABLE_FLAG = 0x4;
    static AUTH_CLAWBACK_ENABLED_FLAG = 0x8;
    static decode(flagsBitmask) {
        const val = Math.max(0, Math.floor(flagsBitmask));
        return {
            authRequired: (val & this.AUTH_REQUIRED_FLAG) !== 0,
            authRevocable: (val & this.AUTH_REVOCABLE_FLAG) !== 0,
            authImmutable: (val & this.AUTH_IMMUTABLE_FLAG) !== 0,
            authClawbackEnabled: (val & this.AUTH_CLAWBACK_ENABLED_FLAG) !== 0
        };
    }
    static encode(flags) {
        let bitmask = 0;
        if (flags.authRequired)
            bitmask |= this.AUTH_REQUIRED_FLAG;
        if (flags.authRevocable)
            bitmask |= this.AUTH_REVOCABLE_FLAG;
        if (flags.authImmutable)
            bitmask |= this.AUTH_IMMUTABLE_FLAG;
        if (flags.authClawbackEnabled)
            bitmask |= this.AUTH_CLAWBACK_ENABLED_FLAG;
        return bitmask;
    }
}
//# sourceMappingURL=account_flag_inspector.js.map