export class ObliviousTransferProtocol {
    static transfer1Of2(m0, m1, choiceBit) {
        const messages = [m0, m1];
        return {
            receivedMessage: messages[choiceBit],
            senderLearnedChoice: false
        };
    }
}
//# sourceMappingURL=oblivious_transfer.js.map