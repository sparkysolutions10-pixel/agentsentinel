export interface SmpcShare {
    participantId: string;
    shareIndex: number;
    value: number;
    commitmentHash: string;
}
export declare class SmpcConsistencyChecker {
    static verifyShare(share: SmpcShare, salt: string): boolean;
    static isolateMaliciousParties(shares: SmpcShare[], salt: string): {
        validShares: SmpcShare[];
        evictedParties: string[];
    };
}
//# sourceMappingURL=smpc_consistency.d.ts.map