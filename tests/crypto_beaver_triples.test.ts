import { describe, it, expect } from 'vitest';
import { BeaverTripleGenerator } from '../src/crypto/beaver_triples.js';

describe('Beaver Triple Generator (#829 & #830)', () => {
  it('generates valid multiplication triples and correctly evaluates shares', () => {
    const triple = BeaverTripleGenerator.generateTriple(500);
    expect(triple.c).toBe(triple.a * triple.b);

    const x = 7;
    const y = 9;
    const product = BeaverTripleGenerator.multiplyShares(x, y, triple);
    expect(product).toBe(63);
  });
});
