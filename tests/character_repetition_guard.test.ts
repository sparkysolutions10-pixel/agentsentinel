import { describe, it, expect } from 'vitest';
import { CharacterRepetitionGuard } from '../src/utils/character_repetition_guard.js';

describe('CharacterRepetitionGuard', () => {
  it('detects and sanitizes repetitive spam characters', () => {
    const flood = 'a'.repeat(60);
    expect(CharacterRepetitionGuard.hasExcessiveRepetition(flood, 50)).toBe(true);
    const sanitized = CharacterRepetitionGuard.sanitize(flood, 10);
    expect(sanitized.length).toBe(10);
  });
});
