import { Verdict } from '../types.js';
export function createClipAlignmentVerifierRule(minSimilarity = 0.15) {
    return {
        id: 'rag-clip-alignment-verifier',
        name: 'Verify Multimodal CLIP Embedding Alignment',
        category: 'custom',
        priority: 880,
        enabled: true,
        evaluate: (ctx) => {
            const sim = ctx.params?.clipSimilarity ?? ctx.params?.alignmentScore;
            if (typeof sim === 'number') {
                if (sim < minSimilarity) {
                    return {
                        ruleId: 'rag-clip-alignment-verifier',
                        ruleName: 'Verify Multimodal CLIP Embedding Alignment',
                        severity: 'high',
                        verdict: Verdict.BLOCK,
                        reason: `Multimodal image-text similarity ${sim.toFixed(3)} is below minimum alignment threshold ${minSimilarity}.`,
                        detectedPattern: `clip-misalignment=${sim.toFixed(3)}`,
                    };
                }
            }
            return null;
        }
    };
}
//# sourceMappingURL=clip_alignment_verifier.js.map