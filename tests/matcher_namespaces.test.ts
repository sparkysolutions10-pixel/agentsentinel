import { describe, it, expect } from 'vitest';
import { matchesPattern, matchesAnyPattern, compilePattern } from '../src/matcher.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Tool Pattern Matcher - Diverse Namespaces & Edge Cases (Issue #23)', () => {
  describe('MCP Namespace Glob Evaluation', () => {
    it('correctly matches terminal:* namespace and isolates from other namespaces', () => {
      const isTerminal = compilePattern('terminal:*');

      expect(isTerminal('terminal:execute')).toBe(true);
      expect(isTerminal('terminal:spawn')).toBe(true);
      expect(isTerminal('terminal:kill')).toBe(true);

      // Rejections
      expect(isTerminal('terminal_runner:execute')).toBe(false);
      expect(isTerminal('shell:execute')).toBe(false);
      expect(isTerminal('bash:execute')).toBe(false);
    });

    it('correctly matches fs:* namespace and sub-action globs', () => {
      const isFsRead = compilePattern('fs:read_*');

      expect(isFsRead('fs:read_file')).toBe(true);
      expect(isFsRead('fs:read_directory')).toBe(true);
      expect(isFsRead('fs:read_stream')).toBe(true);

      // Rejections
      expect(isFsRead('fs:write_file')).toBe(false);
      expect(isFsRead('fs:delete_file')).toBe(false);
      expect(isFsRead('s3:read_file')).toBe(false);
    });

    it('correctly matches multi-segment hierarchical namespaces (e.g. cloud:provider:service:action)', () => {
      expect(matchesPattern('aws:s3:buckets:delete', 'aws:*:*:delete')).toBe(true);
      expect(matchesPattern('aws:iam:users:delete', 'aws:*:*:delete')).toBe(true);
      expect(matchesPattern('gcp:storage:buckets:delete', 'aws:*:*:delete')).toBe(false);
      expect(matchesPattern('aws:s3:buckets:list', 'aws:*:*:delete')).toBe(false);
    });

    it('handles special characters, dashes, and periods in tool identifiers', () => {
      expect(matchesPattern('mcp-server.v1:tool_exec', 'mcp-server.*:tool_*')).toBe(true);
      expect(matchesPattern('corp.internal.sec:db.query', 'corp.internal.*:*.query')).toBe(true);
      expect(matchesPattern('corp.external:db.query', 'corp.internal.*:*.query')).toBe(false);
    });
  });

  describe('End-to-End SentinelEngine Namespace Policy Enforcement', () => {
    it('enforces namespace separation and wildcards across multi-agent tool calls', async () => {
      const engine = new SentinelEngine();

      engine.injectPolicy({
        version: '1.0',
        rules: [
          {
            id: 'block-destructive-terminal',
            name: 'Block Destructive Terminal',
            category: 'shell',
            priority: 200,
            match: {
              tools: ['terminal:*', 'bash:*'],
              patterns: ['rm -rf', 'mkfs', 'dd if='],
            },
            action: {
              verdict: 'BLOCK',
              reason: 'Destructive command prohibited in terminal namespace',
            },
          },
          {
            id: 'allow-safe-fs',
            name: 'Audit File System Read',
            category: 'fs',
            priority: 100,
            match: {
              tools: ['fs:read_*'],
            },
            action: {
              verdict: 'ALLOW',
              reason: 'Read-only fs operations allowed',
            },
          },
        ],
      });

      // 1. terminal:execute with rm -rf -> BLOCKED
      const res1 = await engine.evaluate({
        id: 't1',
        toolName: 'terminal:execute',
        category: 'shell',
        params: { cmd: 'rm -rf /var/log' },
        timestamp: Date.now(),
      });
      expect(res1.verdict).toBe(Verdict.BLOCK);
      expect(res1.violations[0].ruleId).toBe('block-destructive-terminal');

      // 2. terminal:execute with ls -la -> ALLOWED (no pattern match)
      const res2 = await engine.evaluate({
        id: 't2',
        toolName: 'terminal:execute',
        category: 'shell',
        params: { cmd: 'ls -la' },
        timestamp: Date.now(),
      });
      expect(res2.verdict).toBe(Verdict.ALLOW);

      // 3. fs:read_file -> ALLOWED
      const res3 = await engine.evaluate({
        id: 't3',
        toolName: 'fs:read_file',
        category: 'fs',
        params: { path: '/home/user/doc.txt' },
        timestamp: Date.now(),
      });
      expect(res3.verdict).toBe(Verdict.ALLOW);

      // 4. fs:write_file -> ALLOWED by default (rule only matched fs:read_*)
      const res4 = await engine.evaluate({
        id: 't4',
        toolName: 'fs:write_file',
        category: 'fs',
        params: { path: '/home/user/doc.txt', content: 'test' },
        timestamp: Date.now(),
      });
      expect(res4.verdict).toBe(Verdict.ALLOW);
      expect(res4.violations).toHaveLength(0);
    });
  });
});
