import crypto from 'crypto';
export class SmpcConsistencyChecker {
    static verifyShare(share, salt) {
        const expectedHash = crypto.createHash('sha256').update(`${share.value}:${salt}`).digest('hex');
        return share.commitmentHash === expectedHash;
    }
    static isolateMaliciousParties(shares, salt) {
        const validShares = [];
        const evictedParties = [];
        for (const s of shares) {
            if (SmpcConsistencyChecker.verifyShare(s, salt)) {
                validShares.push(s);
            }
            else {
                evictedParties.push(s.participantId);
            }
        }
        return { validShares, evictedParties };
    }
}
//# sourceMappingURL=smpc_consistency.js.map