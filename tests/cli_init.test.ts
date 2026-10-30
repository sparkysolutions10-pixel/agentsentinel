import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { runCli, CLI_EXIT_CODES } from '../src/cli/index.js';
import { scaffoldPolicy, PRESET_CONFIGS } from '../src/cli/init.js';
import { validatePolicyConfig } from '../src/policy.js';

describe('AgentSentinel Init Command Project Scaffolding (#117 & #118)', () => {
  const testDir = path.join(process.cwd(), 'temp_cli_init_test');

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

  it('scaffolds enterprise policy template by default and passes policy validation', async () => {
    const res = scaffoldPolicy(testDir, 'enterprise');
    expect(res.success).toBe(true);
    expect(fs.existsSync(res.filePath)).toBe(true);

    const raw = fs.readFileSync(res.filePath, 'utf8');
    const parsed = JSON.parse(raw);

    // Schema validation must succeed
    const validated = validatePolicyConfig(parsed);
    expect(validated.version).toBe('1.0');
    expect(validated.rules.length).toBeGreaterThanOrEqual(4);

    const ruleIds = validated.rules.map((r) => r.id);
    expect(ruleIds).toContain('ent-block-destructive-shell');
    expect(ruleIds).toContain('ent-block-sql-table-drops');
    expect(ruleIds).toContain('ent-block-cloud-metadata-ssrf');
    expect(ruleIds).toContain('ent-redact-sensitive-tokens');
  });

  it('scaffolds developer and minimal presets matching declarative schema', async () => {
    for (const preset of ['developer', 'minimal'] as const) {
      const targetPath = path.join(testDir, `policy_${preset}.json`);
      const res = scaffoldPolicy(targetPath, preset);

      expect(res.success).toBe(true);
      const raw = fs.readFileSync(res.filePath, 'utf8');
      const validated = validatePolicyConfig(JSON.parse(raw));
      expect(validated.rules.length).toBeGreaterThan(0);
    }
  });

  it('refuses to overwrite existing configuration without --force', async () => {
    const targetFile = path.join(testDir, 'agentsentinel.policy.json');
    fs.writeFileSync(targetFile, '{"version":"0.1","rules":[]}', 'utf8');

    let err = '';
    const code = await runCli(['init', testDir], () => {}, (msg) => (err += msg));

    expect(code).toBe(CLI_EXIT_CODES.INVALID_ARGS);
    expect(err).toContain('already exists');

    // Original content remains untouched
    expect(fs.readFileSync(targetFile, 'utf8')).toBe('{"version":"0.1","rules":[]}');
  });

  it('overwrites existing configuration when --force is provided', async () => {
    const targetFile = path.join(testDir, 'agentsentinel.policy.json');
    fs.writeFileSync(targetFile, '{"version":"old","rules":[]}', 'utf8');

    let out = '';
    const code = await runCli(['init', testDir, '--force', '--preset', 'minimal'], (msg) => (out += msg));

    expect(code).toBe(CLI_EXIT_CODES.SUCCESS);
    expect(out).toContain('Successfully created AgentSentinel policy configuration');

    const content = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    expect(content.name).toContain('Minimal');
  });

  it('all presets in PRESET_CONFIGS are strictly valid DeclarativePolicyConfigs', () => {
    for (const [name, config] of Object.entries(PRESET_CONFIGS)) {
      expect(() => validatePolicyConfig(config)).not.toThrow();
    }
  });
});
