import { Verdict } from '../types.js';
export function createDocumentChunkClampRule(maxChars = 8192) {
    return {
        id: 'rag-document-chunk-clamp',
        name: 'Clamp Document Chunk Length and Token Overflow',
        category: 'custom',
        priority: 840,
        enabled: true,
        evaluate: (ctx) => {
            const text = ctx.params?.chunkText || ctx.params?.chunk || ctx.params?.text;
            if (typeof text === 'string' && text.length > maxChars) {
                return {
                    ruleId: 'rag-document-chunk-clamp',
                    ruleName: 'Clamp Document Chunk Length and Token Overflow',
                    severity: 'high',
                    verdict: Verdict.BLOCK,
                    reason: `Document chunk length ${text.length} exceeds max allowed ceiling of ${maxChars} chars.`,
                    detectedPattern: 'chunk-token-overflow',
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=document_chunk_clamp.js.map