import { describe, it, expect } from 'vitest';
import {
  scrubLLMKeys,
  createLLMKeyScrubberRule,
} from '../src/secrets/llm_key_scrubber.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('OpenAI/Anthropic Key Redaction with [REDACTED_API_KEY] (Issue #84)', () => {
  const sampleOpenAIKey = 'sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz0123456789-_AbCdEfGhIjKlMnOp';
  const sampleAnthropicKey = 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';

  describe('scrubLLMKeys with [REDACTED_API_KEY] replacement', () => {
    it('replaces OpenAI key with [REDACTED_API_KEY] without altering surrounding text', () => {
      const original = `Authorization: Bearer ${sampleOpenAIKey} ; Content-Type: application/json`;
      const expected = 'Authorization: Bearer [REDACTED_API_KEY] ; Content-Type: application/json';

      const result = scrubLLMKeys(original, { replacement: '[REDACTED_API_KEY]' });
      expect(result.hasMatches).toBe(true);
      expect(result.scrubbedText).toBe(expected);
    });

    it('replaces Anthropic key with [REDACTED_API_KEY] inside source code without breaking syntax', () => {
      const code = `
        import Anthropic from '@anthropic-ai/sdk';
        const anthropic = new Anthropic({
          apiKey: '${sampleAnthropicKey}',
        });
      `;

      const result = scrubLLMKeys(code, { replacement: '[REDACTED_API_KEY]' });
      expect(result.hasMatches).toBe(true);
      expect(result.scrubbedText).toContain("apiKey: '[REDACTED_API_KEY]'");
      expect(result.scrubbedText).toContain("import Anthropic from '@anthropic-ai/sdk';");
      expect(result.scrubbedText).not.toContain(sampleAnthropicKey);
    });

    it('replaces multiple keys in JSON payload preserving JSON structure', () => {
      const jsonStr = JSON.stringify(
        {
          provider_openai: sampleOpenAIKey,
          provider_anthropic: sampleAnthropicKey,
          model: 'claude-3-5-sonnet',
          max_tokens: 4096,
        },
        null,
        2
      );

      const result = scrubLLMKeys(jsonStr, { replacement: '[REDACTED_API_KEY]' });
      expect(result.hasMatches).toBe(true);
      expect(result.matches).toHaveLength(2);

      const parsed = JSON.parse(result.scrubbedText);
      expect(parsed.provider_openai).toBe('[REDACTED_API_KEY]');
      expect(parsed.provider_anthropic).toBe('[REDACTED_API_KEY]');
      expect(parsed.model).toBe('claude-3-5-sonnet');
      expect(parsed.max_tokens).toBe(4096);
    });

    it('does not modify text that contains no API keys', () => {
      const normal = 'const message = "OpenAI and Anthropic are leading AI research labs.";';
      const result = scrubLLMKeys(normal, { replacement: '[REDACTED_API_KEY]' });
      expect(result.hasMatches).toBe(false);
      expect(result.scrubbedText).toBe(normal);
    });
  });

  describe('Sentinel Rule enforcement against tool calls with OpenAI/Anthropic keys', () => {
    it('blocks tool calls with leaked key with critical severity', () => {
      const rule = createLLMKeyScrubberRule({ mode: 'block' });
      const ctx: ToolCallContext = {
        toolName: 'api_request',
        params: {
          token: sampleOpenAIKey,
        },
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.ruleId).toBe('secrets-scrub-llm-api-keys');
      expect(violation?.reason).toContain('OpenAI API key intercepted');
    });
  });
});
