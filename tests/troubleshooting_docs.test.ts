import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Troubleshooting & Security Violation Recovery Documentation (#192)', () => {
  const troubleshootingPath = path.resolve(__dirname, '../TROUBLESHOOTING.md');
  const readmePath = path.resolve(__dirname, '../README.md');

  it('TROUBLESHOOTING.md exists and is non-empty', () => {
    expect(fs.existsSync(troubleshootingPath)).toBe(true);
    const content = fs.readFileSync(troubleshootingPath, 'utf-8');
    expect(content.length).toBeGreaterThan(500);
    expect(content).toContain('AgentSentinel Troubleshooting & Violation Recovery Guide');
  });

  it('covers all 7 primary security violation recovery scenarios', () => {
    const content = fs.readFileSync(troubleshootingPath, 'utf-8');
    expect(content).toContain('shell-block-destructive');
    expect(content).toContain('sql-block-unconstrained-delete');
    expect(content).toContain('secrets-shannon-entropy');
    expect(content).toContain('fs-workspace-jail-validator');
    expect(content).toContain('network-block-cloud-metadata-ssrf');
    expect(content).toContain('rules-tool-loop-rate-limiter');
    expect(content).toContain('network-destination-allowlist');
  });

  it('documents CLI exit codes and recovery actions', () => {
    const content = fs.readFileSync(troubleshootingPath, 'utf-8');
    expect(content).toContain('Exit Codes Reference (CLI)');
    expect(content).toContain('0');
    expect(content).toContain('1');
    expect(content).toContain('2');
    expect(content).toContain('3');
    expect(content).toContain('4');
  });

  it('verifies README.md links to TROUBLESHOOTING.md and walkthroughs', () => {
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    expect(readmeContent).toContain('[TROUBLESHOOTING.md](TROUBLESHOOTING.md)');
    expect(readmeContent).toContain('[Claude Desktop MCP](examples/claude_desktop_walkthrough.md)');
    expect(readmeContent).toContain('[Cursor AI](examples/cursor_ai_walkthrough.md)');
  });
});
