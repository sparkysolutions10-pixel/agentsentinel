/**
 * Auto-generated Enterprise Security Invariant: Issue #1960
 * Title: feat(fintech): implement Luhn-valid credit card number memory scrubber with zero-log policy
 */
export declare class PciDssCardNumberMemoryScrubber {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=pci_dss_card_number_memory_scrubber.d.ts.map