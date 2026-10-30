import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { runCli, CLI_EXIT_CODES } from '../src/cli/index.js';
import { validatePolicyConfig, compileDeclarativeRule } from '../src/policy.js';
import { SentinelEngine } from '../src/index.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('CLI Init Valid Configuration Template Test Suite (#118)', () => {
  const testDir = path.join(process.cwd(), 'temp_cli_init_val_dir');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('compiles and executes the generated enterprise template rules in SentinelEngine', async () => {
    const exitCode = await runCli(['init', testDir]);
    expect(exitCode).toBe(CLI_EXIT_CODES.SUCCESS);

    const configPath = path.join(testDir, 'agentsentinel.policy.json');
    expect(fs.existsSync(configPath)).toBe(true);

    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    const validated = validatePolicyConfig(parsed);

    // Register each rule in fresh engine
    const engine = new SentinelEngine();
    for (const ruleDef of validated.rules) {
      const compiled = compileDeclarativeRule(ruleDef);
      engine.registry.register(compiled);
    }

    expect(engine.registry.size).toBe(validated.rules.length);

    // Test 1: Verify ent-block-destructive-shell blocks rm -rf /
    const rmCtx: ToolCallContext = {
      id: 'c1',
      toolName: 'bash_exec',
      params: { command: 'rm -rf /' },
      timestamp: Date.now(),
    };
    const rmRes = await engine.evaluate(rmCtx);
    expect(rmRes.allowed).toBe(false);
    expect(rmRes.verdict).toBe(Verdict.BLOCK);
    expect(rmRes.violations[0].ruleId).toBe('ent-block-destructive-shell');

    // Test 2: Verify ent-block-sql-table-drops blocks DROP TABLE
    const sqlCtx: ToolCallContext = {
      id: 'c2',
      toolName: 'sql_exec',
      params: { query: 'DROP TABLE accounts;' },
      timestamp: Date.now(),
    };
    const sqlRes = await engine.evaluate(sqlCtx);
    expect(sqlRes.allowed).toBe(false);
    expect(sqlRes.verdict).toBe(Verdict.BLOCK);
    expect(sqlRes.violations[0].ruleId).toBe('ent-block-sql-table-drops');

    // Test 3: Verify ent-block-cloud-metadata-ssrf blocks AWS metadata endpoint
    const ssrfCtx: ToolCallContext = {
      id: 'c3',
      toolName: 'http_request',
      params: { url: 'http://169.254.169.254/latest/meta-data/' },
      timestamp: Date.now(),
    };
    const ssrfRes = await engine.evaluate(ssrfCtx);
    expect(ssrfRes.allowed).toBe(false);
    expect(ssrfRes.verdict).toBe(Verdict.BLOCK);
    expect(ssrfRes.violations[0].ruleId).toBe('ent-block-cloud-metadata-ssrf');

    // Test 4: Safe command passes cleanly
    const safeCtx: ToolCallContext = {
      id: 'c4',
      toolName: 'bash_exec',
      params: { command: 'git status' },
      timestamp: Date.now(),
    };
    const safeRes = await engine.evaluate(safeCtx);
    expect(safeRes.allowed).toBe(true);
    expect(safeRes.verdict).toBe(Verdict.ALLOW);
  });

  it('scaffolds policy in deeply nested non-existent directory automatically', async () => {
    const deepNestedDir = path.join(testDir, 'sub', 'deep', 'folder');
    const exitCode = await runCli(['init', deepNestedDir, '--preset', 'developer']);

    expect(exitCode).toBe(CLI_EXIT_CODES.SUCCESS);

    const configPath = path.join(deepNestedDir, 'agentsentinel.policy.json');
    expect(fs.existsSync(configPath)).toBe(true);

    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    expect(parsed.name).toContain('Developer');
  });

  it('ensures template files end with newline and 2-space indentation', async () => {
    await runCli(['init', testDir]);
    const configPath = path.join(testDir, 'agentsentinel.policy.json');
    const text = fs.readFileSync(configPath, 'utf8');

    expect(text.endsWith('\n')).toBe(true);
    expect(text).toContain('  "version": "1.0",');
  });
});
