import { describe, it, expect } from 'vitest';
import { createMultilayerUnwrapperRule, unwrapMultiLayer } from '../src/armor/multilayer_unwrapper.js';
import { Verdict } from '../src/types.js';

describe('MultilayerUnwrapper', () => {
  const rule = createMultilayerUnwrapperRule();

  it('unwraps dual layer encoding (Base64 inside URL-encode)', () => {
    const input = 'aWdub3JlIGFsbA%3D%3D';
    expect(unwrapMultiLayer(input)).toBe('ignore all');
  });

  it('blocks dual-layer obfuscated attack payload', () => {
    const input = 'aWdub3JlIGFsbA%3D%3D';
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { text: input }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
