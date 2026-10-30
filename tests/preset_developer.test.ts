import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { SentinelEngine } from '../src/index.js';
import { validatePolicyConfig } from '../src/policy.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Developer Sandbox Permissive Security Policy Preset (#189)', () => {
  const presetPath = path.resolve(__dirname, '../presets/developer-sandbox.policy.json');

  it('exists and contains valid JSON syntax', () => {
    expect(fs.existsSync(presetPath)).toBe(true);
    const rawContent = fs.readFileSync(presetPath, 'utf-8');
    const parsed = JSON.parse(rawContent);
    expect(parsed.version).toBe('1.0');
    expect(parsed.name).toContain('Developer Sandbox');
    expect(Array.isArray(parsed.rules)).toBe(true);
    expect(parsed.rules.length).toBeGreaterThanOrEqual(5);
  });

  it('passes strict schema validation via validatePolicyConfig()', () => {
    const rawContent = fs.readFileSync(presetPath, 'utf-8');
    const parsed = JSON.parse(rawContent);
    const validated = validatePolicyConfig(parsed);

    expect(validated.version).toBe('1.0');
    expect(validated.rules.length).toBe(parsed.rules.length);
    for (const rule of validated.rules) {
      expect(rule.id).toBeTruthy();
      expect(rule.name).toBeTruthy();
      expect(typeof rule.priority).toBe('number');
      expect(rule.action.verdict).toBeDefined();
    }
  });

  it('still blocks catastrophic operating system destruction', async () => {
    const rawContent = fs.readFileSync(presetPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    const engine = new SentinelEngine();
    engine.loadPolicy(parsed);

    // Root rm is still strictly blocked
    const rmCtx: ToolCallContext = {
      id: 'test_dev_rm',
      toolName: 'bash',
      params: { command: 'rm -rf / --no-preserve-root' },
      timestamp: Date.now()
    };
    const rmRes = await engine.evaluate(rmCtx);
    expect(rmRes.allowed).toBe(false);
    expect(rmRes.verdict).toBe(Verdict.BLOCK);
    expect(rmRes.violations[0].ruleId).toBe('dev-block-catastrophic-root-rm');

    // Cloud metadata SSRF is still blocked
    const ssrfCtx: ToolCallContext = {
      id: 'test_dev_ssrf',
      toolName: 'http_request',
      params: { url: 'http://169.254.169.254/latest/meta-data/' },
      timestamp: Date.now()
    };
    const ssrfRes = await engine.evaluate(ssrfCtx);
    expect(ssrfRes.allowed).toBe(false);
    expect(ssrfRes.verdict).toBe(Verdict.BLOCK);
  });

  it('downgrades local table drop to CONFIRM instead of hard blocking', async () => {
    const rawContent = fs.readFileSync(presetPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    const engine = new SentinelEngine();
    engine.loadPolicy(parsed);

    // DROP TABLE triggers confirmation in dev mode
    const dropCtx: ToolCallContext = {
      id: 'test_dev_drop',
      toolName: 'query_database',
      params: { query: 'DROP TABLE test_users;' },
      timestamp: Date.now()
    };
    const dropRes = await engine.evaluate(dropCtx);
    expect(dropRes.verdict).toBe(Verdict.CONFIRM);
    expect(dropRes.violations[0].ruleId).toBe('dev-confirm-sql-table-drops');
    expect(dropRes.violations[0].reason).toContain('Please confirm if you intend to reset your local test table');

    // TRUNCATE TABLE triggers confirmation in dev mode
    const truncCtx: ToolCallContext = {
      id: 'test_dev_trunc',
      toolName: 'query_database',
      params: { query: 'TRUNCATE TABLE local_cache;' },
      timestamp: Date.now()
    };
    const truncRes = await engine.evaluate(truncCtx);
    expect(truncRes.verdict).toBe(Verdict.CONFIRM);
    expect(truncRes.violations[0].ruleId).toBe('dev-confirm-sql-truncate');
  });

  it('allows normal development commands, builds, and queries', async () => {
    const rawContent = fs.readFileSync(presetPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    const engine = new SentinelEngine();
    engine.loadPolicy(parsed);

    const devCalls: ToolCallContext[] = [
      { id: 'dev_build', toolName: 'bash', params: { command: 'npm run build' }, timestamp: Date.now() },
      { id: 'dev_test', toolName: 'bash', params: { command: 'npm test -- --run' }, timestamp: Date.now() },
      { id: 'dev_sql', toolName: 'query_database', params: { query: 'SELECT * FROM users;' }, timestamp: Date.now() },
      { id: 'dev_insert', toolName: 'query_database', params: { query: 'INSERT INTO users (name) VALUES (\'Alice\');' }, timestamp: Date.now() }
    ];

    for (const call of devCalls) {
      const res = await engine.evaluate(call);
      expect(res.allowed).toBe(true);
      expect(res.verdict).toBe(Verdict.ALLOW);
    }
  });
});
