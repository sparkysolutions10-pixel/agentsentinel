export class EnterpriseLicenseValidator {
    static isValid(license, nowMs = Date.now()) {
        if (!license || !license.tier || typeof license.expiresAt !== 'number')
            return false;
        return license.expiresAt > nowMs && license.seats > 0;
    }
}
//# sourceMappingURL=enterprise_license_validator.js.map