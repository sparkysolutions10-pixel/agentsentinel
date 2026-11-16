import { Verdict } from '../types.js';
export function createAdversarialClusterDetectorRule(maxDenseCount = 10) {
    return {
        id: 'rag-adversarial-cluster-detector',
        name: 'Detect Adversarial Semantic Cluster Poisoning',
        category: 'custom',
        priority: 860,
        enabled: true,
        evaluate: (ctx) => {
            const vectors = ctx.params?.vectors || ctx.params?.documents;
            if (Array.isArray(vectors) && vectors.length > maxDenseCount) {
                const clusterTag = ctx.params?.cluster || ctx.params?.group;
                if (clusterTag === 'synthetic' || ctx.params?.forcedCollision === true) {
                    return {
                        ruleId: 'rag-adversarial-cluster-detector',
                        ruleName: 'Detect Adversarial Semantic Cluster Poisoning',
                        severity: 'critical',
                        verdict: Verdict.BLOCK,
                        reason: `Potential semantic collision poisoning detected: Batch of ${vectors.length} artificially concentrated vectors.`,
                        detectedPattern: 'dense-vector-collision-flood',
                    };
                }
            }
            return null;
        }
    };
}
//# sourceMappingURL=adversarial_cluster_detector.js.map