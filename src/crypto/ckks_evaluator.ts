export class CKKSEmbeddingEvaluator {
  /**
   * Simulates homomorphic encrypted cosine similarity evaluation for floating point embeddings.
   * Tolerates polynomial noise within 1e-4 precision.
   */
  public static computeEncryptedCosineSimilarity(vectorA: number[], vectorB: number[]): { encryptedScore: number; noiseVariance: number } {
    if (vectorA.length !== vectorB.length || vectorA.length === 0) {
      throw new Error('[AgentSentinel] Vector dimensions must match and be greater than 0.');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    const noise = 0.00002; // Controlled CKKS polynomial scale noise

    return {
      encryptedScore: similarity + noise,
      noiseVariance: noise
    };
  }

  public static decryptScore(encryptedResult: { encryptedScore: number; noiseVariance: number }): number {
    return encryptedResult.encryptedScore - encryptedResult.noiseVariance;
  }
}
