/**
 * AgentSentinel - Vector Dimension Mismatch Detection Guard.
 * Enforces strict vector dimensionality boundaries on query, upsert, and search operations
 * across Pinecone, ChromaDB, Qdrant, Milvus, and pgvector. Prevents index corruption
 * and remote server exceptions caused by malformed embedding vectors.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

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

const VECTOR_PARAM_FIELDS = ['vector', 'values', 'embedding', 'embeddings', 'vectors'];

/**
 * Extracts vector arrays from tool parameters.
 */
function extractVectors(params: Record<string, any>): number[][] {
  const vectors: number[][] = [];

  for (const field of VECTOR_PARAM_FIELDS) {
    const val = params[field];
    if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === 'number') {
        vectors.push(val as number[]);
      } else if (val.length > 0 && Array.isArray(val[0])) {
        // Nested array of vectors: [[0.1, ...], [0.2, ...]]
        for (const item of val) {
          if (Array.isArray(item)) {
            vectors.push(item as number[]);
          }
        }
      }
    }
  }

  // Handle documents array with vector property: [{ vector: [...] }, ...]
  if (Array.isArray(params.documents)) {
    for (const doc of params.documents) {
      if (doc && typeof doc === 'object') {
        for (const field of VECTOR_PARAM_FIELDS) {
          if (Array.isArray(doc[field])) {
            vectors.push(doc[field]);
          }
        }
      }
    }
  }

  return vectors;
}

/**
 * Inspects vector dimensions against expected configurations.
 */
export function inspectVectorDimensions(
  params: Record<string, any>,
  options: VectorDimensionGuardOptions = {}
): DimensionInspectionResult {
  if (!params || typeof params !== 'object') {
    return { hasDimensionIssue: false };
  }

  const vectors = extractVectors(params);
  if (vectors.length === 0) {
    return { hasDimensionIssue: false };
  }

  const maxLimit = options.maxDimensionLimit ?? 16384;
  const indexName = params.index ?? params.indexName ?? params.collection ?? params.namespace;

  // Resolve expected dimensions
  let expected: number | number[] | undefined = options.expectedDimensions;
  if (indexName && options.indexDimensionMap && options.indexDimensionMap[indexName] !== undefined) {
    expected = options.indexDimensionMap[indexName];
  }

  for (let i = 0; i < vectors.length; i++) {
    const vec = vectors[i];
    const dim = vec.length;

    // 1. Zero dimension check
    if (dim === 0) {
      return {
        hasDimensionIssue: true,
        actualDimension: 0,
        expectedDimension: expected,
        reason: `Empty vector payload at vector[${i}] (0 dimensions). Valid embeddings must have non-zero dimensions.`,
      };
    }

    // 2. Max dimension ceiling check
    if (dim > maxLimit) {
      return {
        hasDimensionIssue: true,
        actualDimension: dim,
        expectedDimension: expected,
        reason: `Vector dimension (${dim}) exceeds safe maximum limit (${maxLimit}). Potential memory exhaustion attack.`,
      };
    }

    // 3. Expected dimension enforcement
    if (expected !== undefined) {
      if (Array.isArray(expected)) {
        if (!expected.includes(dim)) {
          return {
            hasDimensionIssue: true,
            actualDimension: dim,
            expectedDimension: expected,
            reason: `Vector dimension mismatch at vector[${i}]: Received ${dim} dimensions, expected one of [${expected.join(', ')}].`,
          };
        }
      } else if (dim !== expected) {
        return {
          hasDimensionIssue: true,
          actualDimension: dim,
          expectedDimension: expected,
          reason: `Vector dimension mismatch at vector[${i}]: Received ${dim} dimensions, expected ${expected}. Index corruption prevented.`,
        };
      }
    }
  }

  return { hasDimensionIssue: false };
}

/**
 * Creates SentinelRule to enforce vector dimension boundaries.
 */
export function createVectorDimensionGuardRule(
  options: VectorDimensionGuardOptions = {}
): SentinelRule {
  return {
    id: 'rag-vector-dimension-guard',
    name: 'Validate Vector Embedding Dimensionality and Memory Bounds',
    category: 'network',
    priority: 915,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      if (!ctx.params || typeof ctx.params !== 'object') {
        return null;
      }

      const inspection = inspectVectorDimensions(ctx.params, options);
      if (inspection.hasDimensionIssue) {
        return {
          ruleId: 'rag-vector-dimension-guard',
          ruleName: 'Validate Vector Embedding Dimensionality and Memory Bounds',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: inspection.reason || 'Vector dimension validation failed.',
          detectedPattern: `dim=${inspection.actualDimension}`,
        };
      }

      return null;
    },
  };
}

export const vectorDimensionGuardRule: SentinelRule = createVectorDimensionGuardRule();
