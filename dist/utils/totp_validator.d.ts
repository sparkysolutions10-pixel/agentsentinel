export declare class TotpValidator {
    static generateCode(secret: Buffer, timeStepSeconds?: number, timestampMs?: number): string;
    static verifyCode(token: string, secret: Buffer, windowSteps?: number, timeStepSeconds?: number, timestampMs?: number): boolean;
}
//# sourceMappingURL=totp_validator.d.ts.map