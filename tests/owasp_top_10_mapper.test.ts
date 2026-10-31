import { describe, it, expect } from 'vitest';
import { OwaspTop10Mapper } from '../src/utils/owasp_top10_mapper.js';

describe('OwaspTop10Mapper', () => {
  it('maps prompt injection to OWASP LLM01', () => {
    const mapping = OwaspTop10Mapper.getMapping('prompt_injection');
    expect(mapping?.owaspId).toBe('LLM01');
    expect(mapping?.type).toBe('llm');
  });

  it('maps sql injection to OWASP A03:2021', () => {
    const mapping = OwaspTop10Mapper.getMapping('sql_injection');
    expect(mapping?.owaspId).toBe('A03:2021');
    expect(mapping?.type).toBe('web');
  });
});
