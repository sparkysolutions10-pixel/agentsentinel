import { SentinelRule } from '../types.js';
export interface QdrantGrpcLimiterOptions {
    maxFrameSizeBytes?: number;
    maxConcurrentStreams?: number;
}
export declare function inspectGrpcPayload(params: Record<string, any>, maxFrameSize?: number): {
    isValid: boolean;
    reason?: string;
};
export declare function createQdrantGrpcPayloadLimiterRule(options?: QdrantGrpcLimiterOptions): SentinelRule;
//# sourceMappingURL=qdrant_grpc_limiter.d.ts.map