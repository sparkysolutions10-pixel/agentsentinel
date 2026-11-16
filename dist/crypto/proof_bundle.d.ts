export interface AuditRecord {
    id: string;
    action: string;
    timestamp: number;
    data: string;
}
export interface ProofBundle {
    records: AuditRecord[];
    merkleRoot: string;
    signature: string;
    tpmCounter: number;
}
export declare class CryptoProofBundleExporter {
    static exportBundle(records: AuditRecord[], privateKeyPem?: string): ProofBundle;
    static verifyBundle(bundle: ProofBundle): boolean;
}
//# sourceMappingURL=proof_bundle.d.ts.map