export class GeoIpCountryAllowlist {
  public static isAllowed(countryCode: string, allowedCountries: string[]): boolean {
    if (!countryCode || !Array.isArray(allowedCountries)) return false;
    const clean = countryCode.trim().toUpperCase();
    return allowedCountries.map(c => c.trim().toUpperCase()).includes(clean);
  }
}
