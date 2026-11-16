/**
 * AgentSentinel - JSON-RPC Batch Call Chunker
 * Chunks oversized multi-call JSON-RPC arrays into bounded sub-batches
 * to prevent HTTP 413 Payload Too Large and RPC server memory spikes.
 */
export interface BatchChunkerOptions {
    maxBatchSize?: number;
    maxPayloadBytes?: number;
}
export declare class RpcBatchCallChunker {
    static chunkBatch<T>(items: T[], options?: BatchChunkerOptions): T[][];
}
//# sourceMappingURL=rpc_batch_chunker.d.ts.map