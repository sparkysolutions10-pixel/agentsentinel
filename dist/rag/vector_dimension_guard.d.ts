/**
 * AgentSentinel - Vector Dimension Mismatch Detection Guard.
 * Enforces strict vector dimensionality boundaries on query, upsert, and search operations
 * across Pinecone, ChromaDB, Qdrant, Milvus, and pgvector. Prevents index corruption
 * and remote server exceptions caused by malformed embedding vectors.
 */
import { SentinelRule } from '../types.js';
export interface VectorDimensionGuardOptions {
    /**
     * Expected dimensionality (e.g. 1536 for OpenAI small, 768 for BERT, 3072 for large).
     * Can also be an array of permitted dimensions across multiple models.
     */
    expectedDimensions?: number | number[];
    /**
     * Map of namespace or index name to expected dimension.
     * Example: { 'docs-index': 1536, 'image-index': 512 }
     */
    indexDimensionMap?: Record<string, number>;
    /**
     * Maximum allowed vector dimension to prevent memory allocation attacks.
     * Default: 16384.
     */
    maxDimensionLimit?: number;
}
export interface DimensionInspectionResult {
    hasDimensionIssue: boolean;
    actualDimension?: number;
    expectedDimension?: number | number[];
    reason?: string;
}
/**
 * Inspects vector dimensions against expected configurations.
 */
export declare function inspectVectorDimensions(params: Record<string, any>, options?: VectorDimensionGuardOptions): DimensionInspectionResult;
/**
 * Creates SentinelRule to enforce vector dimension boundaries.
 */
export declare function createVectorDimensionGuardRule(options?: VectorDimensionGuardOptions): SentinelRule;
export declare const vectorDimensionGuardRule: SentinelRule;
//# sourceMappingURL=vector_dimension_guard.d.ts.map