import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { createUnifiedPromptArmorRule } from '../src/armor/unified_prompt_armor.js';

describe('PromptArmorDocsSnippets', () => {
  it('verifies docs/PROMPT_ARMOR.md exists and is documented', () => {
    const docPath = path.resolve('docs/PROMPT_ARMOR.md');
    expect(fs.existsSync(docPath)).toBe(true);
    const content = fs.readFileSync(docPath, 'utf-8');
    expect(content).toContain('PromptArmor Specification');
  });

  it('executes sample code from PROMPT_ARMOR.md without runtime errors', () => {
    const rule = createUnifiedPromptArmorRule();
    const violation = rule.evaluate({
      id: 'snippet-context',
      toolName: 'llm_call',
      params: { prompt: 'Normal safe user inquiry.' },
      timestamp: Date.now()
    });
    expect(violation).toBeNull();
  });
});
