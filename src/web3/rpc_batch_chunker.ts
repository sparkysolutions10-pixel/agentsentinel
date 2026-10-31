/**
 * AgentSentinel - JSON-RPC Batch Call Chunker
 * Chunks oversized multi-call JSON-RPC arrays into bounded sub-batches
 * to prevent HTTP 413 Payload Too Large and RPC server memory spikes.
 */

export interface BatchChunkerOptions {
  maxBatchSize?: number;     // default: 25 requests per batch
  maxPayloadBytes?: number;  // default: 128 KB (131072 bytes)
}

export class RpcBatchCallChunker {
  public static chunkBatch<T>(items: T[], options: BatchChunkerOptions = {}): T[][] {
    const maxCount = options.maxBatchSize ?? 25;
    const maxBytes = options.maxPayloadBytes ?? 131072;

    if (!items || items.length === 0) {
      return [];
    }

    const chunks: T[][] = [];
    let currentChunk: T[] = [];
    let currentBytes = 2; // '[' and ']'

    for (const item of items) {
      const itemBytes = Buffer.byteLength(JSON.stringify(item), 'utf-8') + 1; // + comma

      if (currentChunk.length >= maxCount || (currentBytes + itemBytes > maxBytes && currentChunk.length > 0)) {
        chunks.push(currentChunk);
        currentChunk = [item];
        currentBytes = 2 + itemBytes;
      } else {
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
