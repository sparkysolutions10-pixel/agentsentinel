/**
 * ClaimableBalanceIdParser - Stellar Claimable Balance ID format parsing and validation.
 */
export class ClaimableBalanceIdParser {
    static CLAIMABLE_BALANCE_REGEX = /^[0-9a-f]{72}$/i;
    static isValid(id) {
        if (!id || typeof id !== 'string')
            return false;
        return this.CLAIMABLE_BALANCE_REGEX.test(id.trim());
    }
    static parse(id) {
        if (!this.isValid(id))
            return null;
        const normalized = id.trim().toLowerCase();
        const typeHex = normalized.slice(0, 8);
        const hashHex = normalized.slice(8);
        let balanceType = 'unknown';
        if (typeHex === '00000000') {
            balanceType = 'claimable_balance_id_type_v0';
        }
        return {
            rawId: normalized,
            balanceType,
            typeHex,
            hashHex
        };
    }
}
//# sourceMappingURL=claimable_balance_id_parser.js.map