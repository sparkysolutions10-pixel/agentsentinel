export interface LicensePayload {
  tier: string;
  seats: number;
  expiresAt: number;
}

export class EnterpriseLicenseValidator {
  public static isValid(license: LicensePayload, nowMs: number = Date.now()): boolean {
    if (!license || !license.tier || typeof license.expiresAt !== 'number') return false;
    return license.expiresAt > nowMs && license.seats > 0;
  }
}
