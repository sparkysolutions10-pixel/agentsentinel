import crypto from 'crypto';
export class DoubleRatchetSession {
    rootKey;
    sendingChainKey;
    receivingChainKey;
    messageNumber = 0;
    constructor(sharedMasterSecret) {
        this.rootKey = crypto.createHash('sha256').update(sharedMasterSecret).digest();
        this.sendingChainKey = crypto.createHmac('sha256', this.rootKey).update('send').digest();
        this.receivingChainKey = crypto.createHmac('sha256', this.rootKey).update('recv').digest();
    }
    ratchetSend() {
        const messageKey = crypto.createHmac('sha256', this.sendingChainKey).update('message').digest();
        this.sendingChainKey = crypto.createHmac('sha256', this.sendingChainKey).update('advance').digest();
        this.messageNumber++;
        return { messageKey, messageIndex: this.messageNumber };
    }
    ratchetReceive() {
        const messageKey = crypto.createHmac('sha256', this.receivingChainKey).update('message').digest();
        this.receivingChainKey = crypto.createHmac('sha256', this.receivingChainKey).update('advance').digest();
        return { messageKey };
    }
    healRatchets(newEphemeralSecret) {
        // Advance root key with new entropy to heal from compromise
        this.rootKey = crypto.createHmac('sha256', this.rootKey).update(newEphemeralSecret).digest();
        this.sendingChainKey = crypto.createHmac('sha256', this.rootKey).update('send_healed').digest();
        this.receivingChainKey = crypto.createHmac('sha256', this.rootKey).update('recv_healed').digest();
    }
    getChainState() {
        return { messageNumber: this.messageNumber };
    }
}
//# sourceMappingURL=double_ratchet.js.map