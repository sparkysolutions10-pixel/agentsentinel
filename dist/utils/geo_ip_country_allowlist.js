export class GeoIpCountryAllowlist {
    static isAllowed(countryCode, allowedCountries) {
        if (!countryCode || !Array.isArray(allowedCountries))
            return false;
        const clean = countryCode.trim().toUpperCase();
        return allowedCountries.map(c => c.trim().toUpperCase()).includes(clean);
    }
}
//# sourceMappingURL=geo_ip_country_allowlist.js.map