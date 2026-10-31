import { describe, it, expect } from 'vitest';
import { RpcBatchCallChunker } from '../src/web3/rpc_batch_chunker.js';

describe('RpcBatchCallChunker', () => {
  it('splits requests into bounded chunks based on max item count', () => {
    const requests = Array.from({ length: 65 }, (_, i) => ({
      jsonrpc: '2.0',
      id: i + 1,
      method: 'getHealth'
    }));

    const chunks = RpcBatchCallChunker.chunkBatch(requests, { maxBatchSize: 20 });
    expect(chunks.length).toBe(4);
    expect(chunks[0].length).toBe(20);
    expect(chunks[1].length).toBe(20);
    expect(chunks[2].length).toBe(20);
    expect(chunks[3].length).toBe(5);
  });

  it('handles empty input cleanly', () => {
    const chunks = RpcBatchCallChunker.chunkBatch([]);
    expect(chunks).toEqual([]);
  });
});
