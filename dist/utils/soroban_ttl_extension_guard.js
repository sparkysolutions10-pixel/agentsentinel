export class SorobanTtlExtensionGuard {
    static needsExtension(currentLedger, liveUntilLedger, thresholdLedgers) {
        const remaining = liveUntilLedger - currentLedger;
        return remaining <= thresholdLedgers;
    }
}
//# sourceMappingURL=soroban_ttl_extension_guard.js.map