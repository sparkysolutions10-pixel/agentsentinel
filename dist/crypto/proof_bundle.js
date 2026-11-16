import crypto from 'crypto';
export class CryptoProofBundleExporter {
    static exportBundle(records, privateKeyPem) {
        const hashes = records.map(r => crypto.createHash('sha256').update(JSON.stringify(r)).digest('hex'));
        const combined = hashes.join(':');
        const merkleRoot = crypto.createHash('sha256').update(combined).digest('hex');
        const signature = crypto.createHmac('sha256', 'bundle-secret-key').update(merkleRoot).digest('hex');
        return {
            records,
            merkleRoot,
            signature,
            tpmCounter: Date.now()
        };
    }
    static verifyBundle(bundle) {
        const hashes = bundle.records.map(r => crypto.createHash('sha256').update(JSON.stringify(r)).digest('hex'));
        const combined = hashes.join(':');
        const expectedRoot = crypto.createHash('sha256').update(combined).digest('hex');
        return bundle.merkleRoot === expectedRoot;
    }
}
//# sourceMappingURL=proof_bundle.js.map