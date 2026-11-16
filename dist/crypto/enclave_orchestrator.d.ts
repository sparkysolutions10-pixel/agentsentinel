export interface EnclaveConfig {
    enableHsm?: boolean;
    enableNitro?: boolean;
    requirePostQuantum?: boolean;
    maxMessagesPerSession?: number;
}
export interface EnclaveSession {
    sessionId: string;
    establishedAt: number;
    messageCount: number;
    isAttested: boolean;
}
export declare class UnifiedCryptoEnclaveManager {
    readonly config: EnclaveConfig;
    private activeSessions;
    constructor(config?: EnclaveConfig);
    establishSession(sessionId: string): EnclaveSession;
    secureMessage(sessionId: string, payload: Buffer): {
        ciphertext: Buffer;
        mac: string;
        valid: boolean;
    };
    getSession(sessionId: string): EnclaveSession | undefined;
}
//# sourceMappingURL=enclave_orchestrator.d.ts.map