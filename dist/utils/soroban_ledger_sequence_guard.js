export class SorobanLedgerSequenceGuard {
    static isWithinBounds(currentLedger, minLedger, maxLedger) {
        if (minLedger !== undefined && currentLedger < minLedger)
            return false;
        if (maxLedger !== undefined && currentLedger > maxLedger)
            return false;
        return true;
    }
}
//# sourceMappingURL=soroban_ledger_sequence_guard.js.map