import { describe, it, expect } from 'vitest';
import {
  scrubLLMKeys,
  maskLLMKey,
  scanContextForLLMKeys,
  createLLMKeyScrubberRule,
  llmKeyScrubberRule,
} from '../src/secrets/llm_key_scrubber.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('OpenAI and Anthropic API Key Scrubber (Issue #83)', () => {
  const sampleOpenAIProjectKey = 'sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz0123456789-_AbCdEfGhIjKlMnOp';
  const sampleOpenAISvcAcctKey = 'sk-svcacct-ZyXwVuTsRqPoNmLkJiHgFeDcBa9876543210-_ZyXwVuTsRqPo';
  const sampleAnthropicKey = 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
  const sampleGeminiKey = 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q';

  describe('maskLLMKey redaction', () => {
    it('redacts OpenAI project key while retaining provider prefix and suffix', () => {
      const masked = maskLLMKey(sampleOpenAIProjectKey);
      expect(masked).toBe('sk-proj-***MnOp');
    });

    it('redacts Anthropic key appropriately', () => {
      const masked = maskLLMKey(sampleAnthropicKey);
      expect(masked).toContain('sk-ant-');
      expect(masked).toContain('***');
    });
  });

  describe('scrubLLMKeys text processing', () => {
    it('detects and redacts OpenAI project key in string', () => {
      const input = `export OPENAI_API_KEY="${sampleOpenAIProjectKey}"`;
      const res = scrubLLMKeys(input);
      expect(res.hasMatches).toBe(true);
      expect(res.matches).toHaveLength(1);
      expect(res.matches[0].provider).toBe('OpenAI');
      expect(res.matches[0].keyType).toBe('OpenAI Project Key');
      expect(res.scrubbedText).not.toContain(sampleOpenAIProjectKey);
      expect(res.scrubbedText).toContain('sk-proj-***');
    });

    it('detects and redacts OpenAI service account key', () => {
      const input = `Authorization: Bearer ${sampleOpenAISvcAcctKey}`;
      const res = scrubLLMKeys(input);
      expect(res.hasMatches).toBe(true);
      expect(res.matches[0].provider).toBe('OpenAI');
      expect(res.matches[0].keyType).toBe('OpenAI Service Account Key');
    });

    it('detects and redacts Anthropic API key', () => {
      const input = `anthropic_key = "${sampleAnthropicKey}"`;
      const res = scrubLLMKeys(input);
      expect(res.hasMatches).toBe(true);
      expect(res.matches[0].provider).toBe('Anthropic');
      expect(res.scrubbedText).not.toContain(sampleAnthropicKey);
    });

    it('detects and redacts Google Gemini API key', () => {
      const input = `https://generativelanguage.googleapis.com/v1beta/models?key=${sampleGeminiKey}`;
      const res = scrubLLMKeys(input);
      expect(res.hasMatches).toBe(true);
      expect(res.matches[0].provider).toBe('Google');
    });

    it('handles multiple different keys in a single document', () => {
      const input = `
        OPENAI_API_KEY=${sampleOpenAIProjectKey}
        ANTHROPIC_API_KEY=${sampleAnthropicKey}
      `;
      const res = scrubLLMKeys(input);
      expect(res.matches).toHaveLength(2);
      expect(res.scrubbedText).not.toContain(sampleOpenAIProjectKey);
      expect(res.scrubbedText).not.toContain(sampleAnthropicKey);
    });

    it('leaves text without API keys untouched', () => {
      const safe = 'Using model gpt-4o and claude-3-5-sonnet for synthesis.';
      const res = scrubLLMKeys(safe);
      expect(res.hasMatches).toBe(false);
      expect(res.scrubbedText).toBe(safe);
    });
  });

  describe('llmKeyScrubberRule enforcement', () => {
    it('blocks tool calls with OpenAI keys with critical severity', () => {
      const ctx: ToolCallContext = {
        toolName: 'http_client',
        params: {
          headers: {
            Authorization: `Bearer ${sampleOpenAIProjectKey}`,
          },
        },
      };
      const violation = llmKeyScrubberRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.ruleId).toBe('secrets-scrub-llm-api-keys');
      expect(violation?.reason).toContain('OpenAI API key intercepted');
    });

    it('blocks tool calls with Anthropic keys in environment payload', () => {
      const ctx: ToolCallContext = {
        toolName: 'exec_command',
        params: {
          env: {
            ANTHROPIC_API_KEY: sampleAnthropicKey,
          },
        },
      };
      const violation = llmKeyScrubberRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('Anthropic API key intercepted');
    });

    it('allows benign tool calls without secret keys', () => {
      const ctx: ToolCallContext = {
        toolName: 'exec_command',
        params: {
          command: 'echo "Hello World"',
          env: {
            NODE_ENV: 'production',
          },
        },
      };
      expect(llmKeyScrubberRule.evaluate(ctx)).toBeNull();
    });
  });
});
