import { describe, it, expect, beforeEach } from 'vitest';
import {
  EnterpriseTokenRegistry,
  defaultTokenMask,
} from '../src/secrets/enterprise_token_registry.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Enterprise Custom Token Registry & Scrubber (#105)', () => {
  let registry: EnterpriseTokenRegistry;

  beforeEach(() => {
    registry = new EnterpriseTokenRegistry();
  });

  it('registers and unregisters custom token regex patterns', () => {
    registry.registerRule({
      name: 'acme_internal_key',
      pattern: /ACME-[A-Z0-9]{16}/,
      severity: 'critical',
    });

    expect(registry.getRules()).toHaveLength(1);
    expect(registry.getRules()[0].name).toBe('acme_internal_key');

    const unregistered = registry.unregisterRule('acme_internal_key');
    expect(unregistered).toBe(true);
    expect(registry.getRules()).toHaveLength(0);
  });

  it('throws error when registering an invalid rule', () => {
    expect(() => {
      registry.registerRule({
        name: '',
        pattern: /test/,
      });
    }).toThrow('[EnterpriseTokenRegistry] Rule must specify a valid name and RegExp pattern.');

    expect(() => {
      registry.registerRule({
        name: 'test',
        pattern: null as any,
      });
    }).toThrow();
  });

  it('detects proprietary tokens with custom prefix in text', () => {
    registry.registerRule({
      name: 'globex_auth_token',
      pattern: /GLBX_[a-z0-9]{24}/i,
      severity: 'high',
    });

    const dummyToken = 'GLBX_' + 'abcdef123456789012345678';
    const text = `Executing request with authorization token: ${dummyToken} now`;

    const matches = registry.detectTokens(text);
    expect(matches).toHaveLength(1);
    expect(matches[0].ruleName).toBe('globex_auth_token');
    expect(matches[0].rawToken).toBe(dummyToken);
    expect(matches[0].severity).toBe('high');
    expect(matches[0].maskedToken).toBe(dummyToken.slice(0, 4) + '***' + dummyToken.slice(-4));
  });

  it('supports custom masking functions per rule', () => {
    registry.registerRule({
      name: 'initech_secret',
      pattern: /INITECH_[0-9]{8}/,
      mask: (raw) => `[INITECH_REDACTED_${raw.slice(-3)}]`,
    });

    const token = 'INITECH_' + '12345678';
    const scrubbed = registry.scrubTokens(`Config: ${token}`);
    expect(scrubbed.hasMatches).toBe(true);
    expect(scrubbed.scrubbedText).toBe('Config: [INITECH_REDACTED_678]');
  });

  it('redacts tokens nested inside complex tool parameters', () => {
    registry.registerRule({
      name: 'corp_token',
      pattern: /CORP_SEC_[0-9a-f]{16}/,
      severity: 'critical',
    });

    const token1 = 'CORP_SEC_' + '1122334455667788';
    const token2 = 'CORP_SEC_' + 'aabbccddeeff0011';

    const params = {
      headers: {
        Authorization: `Bearer ${token1}`,
        'X-Env': 'production',
      },
      metadata: {
        keys: [token2, 'safe_value'],
      },
      flag: 42,
    };

    const redacted = registry.redactParams(params);
    expect(redacted.flag).toBe(42);
    expect(redacted.headers.Authorization).toContain('CORP***7788');
    expect(redacted.headers['X-Env']).toBe('production');
    expect(redacted.metadata.keys[0]).toContain('CORP***0011');
    expect(redacted.metadata.keys[1]).toBe('safe_value');
  });

  it('creates SentinelRule that blocks disallowed enterprise tokens', () => {
    registry.registerRule({
      name: 'umbrella_corp_key',
      pattern: /UMB_[A-Z0-9]{12}/,
      severity: 'critical',
    });

    const rule = registry.createSentinelRule({ mode: 'block' });
    expect(rule.id).toBe('secrets-enterprise-custom-tokens');

    const cleanCtx: ToolCallContext = {
      toolName: 'read_metrics',
      params: { metric: 'cpu_usage' },
    };
    expect(rule.evaluate(cleanCtx)).toBeNull();

    const dirtyCtx: ToolCallContext = {
      toolName: 'call_internal_api',
      params: {
        endpoint: 'https://internal.umbrella.corp/v1',
        token: 'UMB_' + 'SECRET123456',
      },
    };

    const violation = rule.evaluate(dirtyCtx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.ruleName).toBe('Block and Redact Enterprise Proprietary Tokens');
    expect(violation?.reason).toContain('umbrella_corp_key');
  });

  it('creates SentinelRule that redacts enterprise tokens when mode is redact', () => {
    registry.registerRule({
      name: 'wayne_enterprises_id',
      pattern: /WAYNE_[0-9]{10}/,
    });

    const rule = registry.createSentinelRule({ mode: 'redact' });
    const ctx: ToolCallContext = {
      toolName: 'log_audit',
      params: {
        message: 'Account: WAYNE_' + '9876543210 initialized',
      },
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.REDACT);
    expect(violation?.redactedParams?.message).toContain('WAYN***3210');
  });

  it('defaultTokenMask correctly handles short and long tokens', () => {
    expect(defaultTokenMask('123')).toBe('****');
    expect(defaultTokenMask('12345678')).toBe('1234***5678');
    expect(defaultTokenMask('LONG_ENTERPRISE_TOKEN_1234')).toBe('LONG***1234');
  });
});
