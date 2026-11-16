export class SorobanAuthModeClassifier {
    static classify(credentials) {
        if (!credentials || !credentials.type)
            return 'None';
        const t = credentials.type.toLowerCase();
        if (t.includes('address'))
            return 'Address';
        if (t.includes('contract'))
            return 'Contract';
        return 'Unknown';
    }
}
//# sourceMappingURL=soroban_auth_mode_classifier.js.map