import { describe, it, expect } from 'vitest';
import { createAudioSpectrogramValidatorRule } from '../src/rag/audio_spectrogram_validator.js';
import { Verdict } from '../src/types.js';

describe('AudioSpectrogramValidator', () => {
  const rule = createAudioSpectrogramValidatorRule([512, 768]);

  it('allows valid audio embedding of 512 dimensions', () => {
    const violation = rule.evaluate({ toolName: 'audio_embed', params: { audioEmbedding: Array(512).fill(0.1) } });
    expect(violation).toBeNull();
  });

  it('blocks malformed audio array with 137 dimensions', () => {
    const violation = rule.evaluate({ toolName: 'audio_embed', params: { audioEmbedding: Array(137).fill(0.1) } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
