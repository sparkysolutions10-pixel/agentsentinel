/**
 * AgentSentinel - UUID v4 Validator Utility
 * Validates RFC-4122 UUID v4 strings including variant and version nibbles.
 */

export class UuidV4Validator {
  private static readonly UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  public static isValid(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') return false;
    return this.UUID_V4_REGEX.test(uuid.trim());
  }

  public static normalize(uuid: string): string {
    if (!this.isValid(uuid)) {
      throw new Error(`Invalid UUID v4 string: "${uuid}"`);
    }
    return uuid.trim().toLowerCase();
  }
}
