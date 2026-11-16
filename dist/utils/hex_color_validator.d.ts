/**
 * Validates and normalizes hexadecimal color codes (#RGB, #RGBA, #RRGGBB, #RRGGBBAA).
 */
export declare class HexColorValidator {
    private static readonly HEX_COLOR_REGEX;
    static isValid(hex: string): boolean;
    static normalize(hex: string): string | null;
}
//# sourceMappingURL=hex_color_validator.d.ts.map