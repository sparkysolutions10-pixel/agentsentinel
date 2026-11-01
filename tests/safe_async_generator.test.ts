import { describe, it, expect } from 'vitest';
import { SafeAsyncGenerator } from '../src/utils/safe_async_generator.js';

describe('SafeAsyncGenerator', () => {
  it('collects async generator output into array', async () => {
    async function* generate() {
      yield 1;
      yield 2;
      yield 3;
    }
    const res = await SafeAsyncGenerator.toArray(generate());
    expect(res).toEqual([1, 2, 3]);
  });
});
