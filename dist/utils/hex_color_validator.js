/**
 * Validates and normalizes hexadecimal color codes (#RGB, #RGBA, #RRGGBB, #RRGGBBAA).
 */
export class HexColorValidator {
    static HEX_COLOR_REGEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    static isValid(hex) {
        if (!hex || typeof hex !== 'string')
            return false;
        return this.HEX_COLOR_REGEX.test(hex.trim());
    }
    static normalize(hex) {
        if (!this.isValid(hex))
            return null;
        let clean = hex.trim().replace(/^#/, '');
        if (clean.length === 3) {
            clean = clean.split('').map(c => c + c).join('');
        }
        return '#' + clean.toLowerCase();
    }
}
//# sourceMappingURL=hex_color_validator.js.map