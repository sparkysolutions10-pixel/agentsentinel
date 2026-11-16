/**
 * AgentSentinel - JSON-RPC Batch Call Chunker
 * Chunks oversized multi-call JSON-RPC arrays into bounded sub-batches
 * to prevent HTTP 413 Payload Too Large and RPC server memory spikes.
 */
export class RpcBatchCallChunker {
    static chunkBatch(items, options = {}) {
        const maxCount = options.maxBatchSize ?? 25;
        const maxBytes = options.maxPayloadBytes ?? 131072;
        if (!items || items.length === 0) {
            return [];
        }
        const chunks = [];
        let currentChunk = [];
        let currentBytes = 2; // '[' and ']'
        for (const item of items) {
            const itemBytes = Buffer.byteLength(JSON.stringify(item), 'utf-8') + 1; // + comma
            if (currentChunk.length >= maxCount || (currentBytes + itemBytes > maxBytes && currentChunk.length > 0)) {
                chunks.push(currentChunk);
                currentChunk = [item];
                currentBytes = 2 + itemBytes;
            }
            else {
                currentChunk.push(item);
                currentBytes += itemBytes;
            }
        }
        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
        }
        return chunks;
    }
}
//# sourceMappingURL=rpc_batch_chunker.js.map