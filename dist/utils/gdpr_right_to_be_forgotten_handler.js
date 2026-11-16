export class GdprRightToBeForgottenHandler {
    static anonymize(userRecord) {
        const anonymized = { ...userRecord };
        if ('email' in anonymized)
            anonymized.email = 'anonymized@gdpr.internal';
        if ('name' in anonymized)
            anonymized.name = 'Anonymous Subject';
        if ('phone' in anonymized)
            anonymized.phone = '+0000000000';
        if ('address' in anonymized)
            anonymized.address = '[DELETED_PER_GDPR]';
        return anonymized;
    }
}
//# sourceMappingURL=gdpr_right_to_be_forgotten_handler.js.map