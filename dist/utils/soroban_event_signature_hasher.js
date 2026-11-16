import crypto from 'crypto';
export class SorobanEventSignatureHasher {
    static hashTopic(topic) {
        return crypto.createHash('sha256').update(topic).digest('hex');
    }
}
//# sourceMappingURL=soroban_event_signature_hasher.js.map