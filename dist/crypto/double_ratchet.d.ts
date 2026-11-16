export declare class DoubleRatchetSession {
    private rootKey;
    private sendingChainKey;
    private receivingChainKey;
    private messageNumber;
    constructor(sharedMasterSecret: Buffer);
    ratchetSend(): {
        messageKey: Buffer;
        messageIndex: number;
    };
    ratchetReceive(): {
        messageKey: Buffer;
    };
    healRatchets(newEphemeralSecret: Buffer): void;
    getChainState(): {
        messageNumber: number;
    };
}
//# sourceMappingURL=double_ratchet.d.ts.map