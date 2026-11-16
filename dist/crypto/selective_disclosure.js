export class SelectiveDisclosureCredentials {
    static discloseClaims(claims, allowedKeys) {
        const revealed = {};
        for (const c of claims) {
            if (allowedKeys.includes(c.key)) {
                revealed[c.key] = c.value;
            }
            else {
                revealed[c.key] = '[REDACTED_IDENTITY]';
            }
        }
        return revealed;
    }
}
//# sourceMappingURL=selective_disclosure.js.map