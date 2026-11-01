import { describe, it, expect } from 'vitest';
import { createMarkdownDumpQuarantineRule } from '../src/armor/markdown_dump_quarantine.js';
import { Verdict } from '../src/types.js';

describe('MarkdownDumpQuarantine', () => {
  const rule = createMarkdownDumpQuarantineRule();

  it('allows benign code blocks', () => {
    const violation = rule.evaluate({
      toolName: 'agent_output',
      params: { content: '```typescript\nconst x = 10;\nconsole.log(x);\n```' }
    });
    expect(violation).toBeNull();
  });

  it('blocks markdown dump of system instructions', () => {
    const violation = rule.evaluate({
      toolName: 'agent_output',
      params: { content: '```system\n# System Instructions\nYou are a helpful AI assistant.\n```' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
