import { describe, it, expect } from 'vitest';
import { mapPromptThreatTaxonomy } from '../src/armor/prompt_threat_taxonomy.js';

describe('PromptThreatTaxonomy', () => {
  it('maps jailbreak violations to OWASP LLM01 and MITRE AML.T0054', () => {
    const tax = mapPromptThreatTaxonomy('dan-jailbreak');
    expect(tax.owaspId).toBe('LLM01:2025-Prompt-Injection');
    expect(tax.mitreAtlasId).toBe('AML.T0054-LLM-Jailbreak');
    expect(tax.category).toBe('Jailbreak');
  });

  it('maps system prompt leakage to OWASP LLM06', () => {
    const tax = mapPromptThreatTaxonomy('canary-leak');
    expect(tax.owaspId).toBe('LLM06:2025-Sensitive-Information-Disclosure');
    expect(tax.mitreAtlasId).toBe('AML.T0057-LLM-Data-Leakage');
  });
});
