export declare class CKKSEmbeddingEvaluator {
    /**
     * Simulates homomorphic encrypted cosine similarity evaluation for floating point embeddings.
     * Tolerates polynomial noise within 1e-4 precision.
     */
    static computeEncryptedCosineSimilarity(vectorA: number[], vectorB: number[]): {
        encryptedScore: number;
        noiseVariance: number;
    };
    static decryptScore(encryptedResult: {
        encryptedScore: number;
        noiseVariance: number;
    }): number;
}
//# sourceMappingURL=ckks_evaluator.d.ts.map