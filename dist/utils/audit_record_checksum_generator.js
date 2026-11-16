import crypto from 'crypto';
export class AuditRecordChecksumGenerator {
    static generate(previousHash, record) {
        const payload = `${previousHash}|${JSON.stringify(record)}`;
        return crypto.createHash('sha256').update(payload).digest('hex');
    }
}
//# sourceMappingURL=audit_record_checksum_generator.js.map