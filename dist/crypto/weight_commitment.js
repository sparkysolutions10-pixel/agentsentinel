import crypto from 'crypto';
export class ModelWeightCommitment {
    static computeCommitment(weightsBuffer) {
        return crypto.createHash('sha384').update(weightsBuffer).digest('hex');
    }
    static verifyCommitment(weightsBuffer, expectedCommitment) {
        return ModelWeightCommitment.computeCommitment(weightsBuffer) === expectedCommitment;
    }
}
//# sourceMappingURL=weight_commitment.js.map