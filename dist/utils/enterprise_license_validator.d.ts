export interface LicensePayload {
    tier: string;
    seats: number;
    expiresAt: number;
}
export declare class EnterpriseLicenseValidator {
    static isValid(license: LicensePayload, nowMs?: number): boolean;
}
//# sourceMappingURL=enterprise_license_validator.d.ts.map