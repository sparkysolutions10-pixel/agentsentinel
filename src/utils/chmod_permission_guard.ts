export class ChmodPermissionGuard {
  public static isSafePermission(modeOctal: number): boolean {
    // Check if other (last octal digit) has write permission (bit 2)
    const otherBits = modeOctal & 0o007;
    return (otherBits & 0o002) === 0;
  }
}
