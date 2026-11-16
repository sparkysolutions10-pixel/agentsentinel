export class SystemRoleSpoofGuard {
    static SPOOF_TOKENS = [
        /<\|im_start\|>system/i,
        /<\|im_end\|>/i,
        /\[INST\]/i,
        /\[\/INST\]/i,
        /\b(?:system|admin|root):\s*(?:you are|ignore)/i,
        /<<SYS>>/i
    ];
    static isSpoofed(input) {
        if (!input || typeof input !== 'string')
            return false;
        return this.SPOOF_TOKENS.some(token => token.test(input));
    }
}
//# sourceMappingURL=system_role_spoof_guard.js.map