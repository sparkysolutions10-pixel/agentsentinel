/**
 * BaseReserveCalculator - Stellar account minimum balance and reserve requirements.
 */
export class BaseReserveCalculator {
    static DEFAULT_BASE_RESERVE_STROOPS = 5000000n; // 0.5 XLM in stroops
    static calculateMinimumBalanceStroops(params) {
        const baseReserve = params.baseReserveStroops ?? this.DEFAULT_BASE_RESERVE_STROOPS;
        const subentries = BigInt(Math.max(0, params.subentries));
        const sponsoring = BigInt(Math.max(0, params.numSponsoring ?? 0));
        const sponsored = BigInt(Math.max(0, params.numSponsored ?? 0));
        const sellingLiabilities = params.sellingLiabilitiesStroops ?? 0n;
        // Minimum balance formula: (2 + subentries + numSponsoring - numSponsored) * baseReserve + sellingLiabilities
        let multiplier = 2n + subentries + sponsoring;
        if (multiplier > sponsored) {
            multiplier -= sponsored;
        }
        else {
            multiplier = 0n;
        }
        return multiplier * baseReserve + sellingLiabilities;
    }
    static calculateAvailableBalanceStroops(currentBalanceStroops, params) {
        const minRequired = this.calculateMinimumBalanceStroops(params);
        if (currentBalanceStroops <= minRequired) {
            return 0n;
        }
        return currentBalanceStroops - minRequired;
    }
    static stroopsToXlm(stroops) {
        const sign = stroops < 0n ? '-' : '';
        const abs = stroops < 0n ? -stroops : stroops;
        const whole = abs / 10000000n;
        const frac = abs % 10000000n;
        const fracStr = frac.toString().padStart(7, '0').replace(/0+$/, '');
        return fracStr ? `${sign}${whole}.${fracStr}` : `${sign}${whole}`;
    }
    static xlmToStroops(xlm) {
        const str = String(xlm).trim();
        const parts = str.split('.');
        const whole = BigInt(parts[0] || '0');
        let fracStr = parts[1] || '0';
        if (fracStr.length > 7) {
            fracStr = fracStr.slice(0, 7);
        }
        else {
            fracStr = fracStr.padEnd(7, '0');
        }
        const frac = BigInt(fracStr);
        return whole * 10000000n + frac;
    }
}
//# sourceMappingURL=base_reserve_calculator.js.map