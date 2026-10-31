/**
 * AccountFlagInspector - Stellar account flags bitmask inspector.
 */

export interface DecodedAccountFlags {
  authRequired: boolean;
  authRevocable: boolean;
  authImmutable: boolean;
  authClawbackEnabled: boolean;
}

export class AccountFlagInspector {
  public static readonly AUTH_REQUIRED_FLAG = 0x1;
  public static readonly AUTH_REVOCABLE_FLAG = 0x2;
  public static readonly AUTH_IMMUTABLE_FLAG = 0x4;
  public static readonly AUTH_CLAWBACK_ENABLED_FLAG = 0x8;

  public static decode(flagsBitmask: number): DecodedAccountFlags {
    const val = Math.max(0, Math.floor(flagsBitmask));
    return {
      authRequired: (val & this.AUTH_REQUIRED_FLAG) !== 0,
      authRevocable: (val & this.AUTH_REVOCABLE_FLAG) !== 0,
      authImmutable: (val & this.AUTH_IMMUTABLE_FLAG) !== 0,
      authClawbackEnabled: (val & this.AUTH_CLAWBACK_ENABLED_FLAG) !== 0
    };
  }

  public static encode(flags: Partial<DecodedAccountFlags>): number {
    let bitmask = 0;
    if (flags.authRequired) bitmask |= this.AUTH_REQUIRED_FLAG;
    if (flags.authRevocable) bitmask |= this.AUTH_REVOCABLE_FLAG;
    if (flags.authImmutable) bitmask |= this.AUTH_IMMUTABLE_FLAG;
    if (flags.authClawbackEnabled) bitmask |= this.AUTH_CLAWBACK_ENABLED_FLAG;
    return bitmask;
  }
}
