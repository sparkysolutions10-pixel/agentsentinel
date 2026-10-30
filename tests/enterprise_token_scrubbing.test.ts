import { describe, it, expect } from 'vitest';
import {
  EnterpriseTokenRegistry,
  defaultEnterpriseTokenRegistry,
  EnterpriseTokenRule,
} from '../src/secrets/enterprise_token_registry.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Enterprise Token Regex Registration & Scrubbing Test Suite (#106)', () => {
  it('handles multiple concurrent proprietary enterprise rules', () => {
    const registry = new EnterpriseTokenRegistry();

    const rules: EnterpriseTokenRule[] = [
      {
        name: 'k8s_cluster_bearer',
        pattern: /k8s-token-[a-f0-9]{32}/i,
        severity: 'critical',
      },
      {
        name: 'salesforce_internal_token',
        pattern: /sfdc_sec_[A-Za-z0-9]{28}/,
        severity: 'high',
      },
      {
        name: 'internal_payroll_api',
        pattern: /workday-live-key-[0-9]{12}/,
        severity: 'critical',
      },
    ];

    rules.forEach((r) => registry.registerRule(r));
    expect(registry.getRules()).toHaveLength(3);

    const k8sToken = 'k8s-token-' + '11223344556677889900aabbccddeeff';
    const sfdcToken = 'sfdc_sec_' + 'ABCDEF1234567890abcdef123456';
    const workdayToken = 'workday-live-key-' + '999888777666';

    const logPayload = [
      `[INFO] Kubernetes cluster sync using bearer: ${k8sToken}`,
      `[DEBUG] Salesforce CRM integration connected with ${sfdcToken}`,
      `[AUDIT] Workday compensation API key: ${workdayToken}`,
    ].join('\n');

    const matches = registry.detectTokens(logPayload);
    expect(matches).toHaveLength(3);

    const ruleNamesFound = matches.map((m) => m.ruleName);
    expect(ruleNamesFound).toContain('k8s_cluster_bearer');
    expect(ruleNamesFound).toContain('salesforce_internal_token');
    expect(ruleNamesFound).toContain('internal_payroll_api');

    const scrubbed = registry.scrubTokens(logPayload);
    expect(scrubbed.hasMatches).toBe(true);
    expect(scrubbed.scrubbedText).not.toContain(k8sToken);
    expect(scrubbed.scrubbedText).not.toContain(sfdcToken);
    expect(scrubbed.scrubbedText).not.toContain(workdayToken);
  });

  it('scrubs multiple occurrences on the exact same line', () => {
    const registry = new EnterpriseTokenRegistry();
    registry.registerRule({
      name: 'vault_approle_secret',
      pattern: /vault-app-[a-z0-9]{16}/,
    });

    const v1 = 'vault-app-' + '1111222233334444';
    const v2 = 'vault-app-' + '5555666677778888';
    const input = `Primary: ${v1}, Secondary: ${v2}`;

    const res = registry.scrubTokens(input);
    expect(res.hasMatches).toBe(true);
    expect(res.matches).toHaveLength(2);
    expect(res.scrubbedText).not.toContain(v1);
    expect(res.scrubbedText).not.toContain(v2);
    expect(res.scrubbedText).toContain('vaul***4444');
    expect(res.scrubbedText).toContain('vaul***8888');
  });

  it('supports global static defaultEnterpriseTokenRegistry singleton', () => {
    defaultEnterpriseTokenRegistry.clear();
    expect(defaultEnterpriseTokenRegistry.getRules()).toHaveLength(0);

    defaultEnterpriseTokenRegistry.registerRule({
      name: 'singleton_test_key',
      pattern: /SNGL_[0-9]{6}/,
    });

    const key = 'SNGL_' + '654321';
    const matches = defaultEnterpriseTokenRegistry.detectTokens(`Key: ${key}`);
    expect(matches).toHaveLength(1);

    defaultEnterpriseTokenRegistry.clear();
    expect(defaultEnterpriseTokenRegistry.getRules()).toHaveLength(0);
  });

  it('handles non-string, null, or empty values in scanContext without crashing', () => {
    const registry = new EnterpriseTokenRegistry();
    registry.registerRule({
      name: 'any_dummy',
      pattern: /DUMMY_[0-9]{4}/,
    });

    const weirdCtx: ToolCallContext = {
      toolName: 'complex_data',
      params: {
        nullVal: null,
        undefVal: undefined,
        numberVal: 12345,
        boolVal: true,
        emptyArr: [],
        deepArr: [null, undefined, 42, { sub: 'clean text' }],
        emptyObj: {},
      },
    };

    const matches = registry.scanContext(weirdCtx);
    expect(matches).toHaveLength(0);
  });

  it('enforces rule evaluation on deeply nested array of objects with custom replacement', () => {
    const registry = new EnterpriseTokenRegistry();
    registry.registerRule({
      name: 'stripe_custom_connect_key',
      pattern: /sk_corp_[a-zA-Z0-9]{16}/,
      replacement: '[CORP_KEY_SCRUBBED]',
    });

    const dummyKey = 'sk_corp_' + '9876543210abcdef';

    const ctx: ToolCallContext = {
      toolName: 'batch_vendor_sync',
      params: {
        vendors: [
          { id: 1, name: 'Vendor 1', credentials: { token: dummyKey } },
          { id: 2, name: 'Vendor 2', credentials: { token: 'safe_key' } },
        ],
      },
    };

    const sentinelRule = registry.createSentinelRule({ mode: 'redact' });
    const violation = sentinelRule.evaluate(ctx);

    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.REDACT);
    expect(violation?.redactedParams?.vendors[0].credentials.token).toBe('[CORP_KEY_SCRUBBED]');
    expect(violation?.redactedParams?.vendors[1].credentials.token).toBe('safe_key');
  });

  it('evaluates rule returning null when all parameters are clean', () => {
    const registry = new EnterpriseTokenRegistry();
    registry.registerRule({
      name: 'internal_api_secret',
      pattern: /INTERNAL_API_[A-Z0-9]{10}/,
    });

    const rule = registry.createSentinelRule({ mode: 'block' });
    const ctx: ToolCallContext = {
      toolName: 'query_public_db',
      params: {
        table: 'users',
        limit: 10,
        filter: 'status = active',
      },
    };

    expect(rule.evaluate(ctx)).toBeNull();
  });
});
