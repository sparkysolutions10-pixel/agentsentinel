export class SorobanSymbolValidator {
    static SYMBOL_REGEX = /^[a-zA-Z0-9_]{1,32}$/;
    static isValid(symbol) {
        if (!symbol || typeof symbol !== 'string')
            return false;
        return this.SYMBOL_REGEX.test(symbol.trim());
    }
}
//# sourceMappingURL=soroban_symbol_validator.js.map