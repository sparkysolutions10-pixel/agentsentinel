export type SorobanAuthMode = 'Address' | 'Contract' | 'None' | 'Unknown';
export declare class SorobanAuthModeClassifier {
    static classify(credentials: {
        type?: string;
        address?: string;
    } | null | undefined): SorobanAuthMode;
}
//# sourceMappingURL=soroban_auth_mode_classifier.d.ts.map