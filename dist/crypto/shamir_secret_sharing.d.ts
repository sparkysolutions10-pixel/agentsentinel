export interface SecretShare {
    x: number;
    y: number;
}
export declare class ShamirSecretSharing {
    static splitSecret(secret: number, totalShares?: number, threshold?: number): SecretShare[];
    static reconstructSecret(shares: SecretShare[]): number;
}
//# sourceMappingURL=shamir_secret_sharing.d.ts.map