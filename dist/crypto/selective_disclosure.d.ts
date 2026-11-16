export interface CredentialClaim {
    key: string;
    value: string;
    blinded: boolean;
}
export declare class SelectiveDisclosureCredentials {
    static discloseClaims(claims: CredentialClaim[], allowedKeys: string[]): Record<string, string>;
}
//# sourceMappingURL=selective_disclosure.d.ts.map