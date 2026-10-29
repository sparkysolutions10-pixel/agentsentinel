import { describe, it, expect } from 'vitest';
import {
  matchesPattern,
  matchesAnyPattern,
  compilePattern,
  globToRegExp,
  parseRegexPattern
} from '../src/matcher.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Tool Pattern Matcher - Wildcards & Regex (Issue #22)', () => {
  describe('Glob / Wildcard Matching', () => {
    it('matches exact strings', () => {
      expect(matchesPattern('fs:read_file', 'fs:read_file')).toBe(true);
      expect(matchesPattern('fs:read_file', 'fs:write_file')).toBe(false);
    });

    it('matches universal glob (*)', () => {
      expect(matchesPattern('anything', '*')).toBe(true);
      expect(matchesPattern('', '*')).toBe(true);
    });

    it('matches prefix globs (e.g. fs:*, db:*)', () => {
      expect(matchesPattern('fs:read_file', 'fs:*')).toBe(true);
      expect(matchesPattern('fs:write_file', 'fs:*')).toBe(true);
      expect(matchesPattern('fs:delete', 'fs:*')).toBe(true);
      expect(matchesPattern('shell:execute', 'fs:*')).toBe(false);
    });

    it('matches suffix globs (e.g. *_query)', () => {
      expect(matchesPattern('sql_query', '*_query')).toBe(true);
      expect(matchesPattern('db_query', '*_query')).toBe(true);
      expect(matchesPattern('query_sql', '*_query')).toBe(false);
    });

    it('matches infix globs (e.g. cloud:*:delete)', () => {
      expect(matchesPattern('cloud:aws:delete', 'cloud:*:delete')).toBe(true);
      expect(matchesPattern('cloud:gcp:delete', 'cloud:*:delete')).toBe(true);
      expect(matchesPattern('cloud:aws:create', 'cloud:*:delete')).toBe(false);
    });

    it('matches single-character wildcard (?)', () => {
      expect(matchesPattern('api:v1:get', 'api:v?:get')).toBe(true);
      expect(matchesPattern('api:v2:get', 'api:v?:get')).toBe(true);
      expect(matchesPattern('api:v10:get', 'api:v?:get')).toBe(false);
    });
  });

  describe('Regex Matching', () => {
    it('matches slash-delimited regex pattern (/^...$/)', () => {
      expect(matchesPattern('shell:exec', '/^shell:(exec|spawn)$/')).toBe(true);
      expect(matchesPattern('shell:spawn', '/^shell:(exec|spawn)$/')).toBe(true);
      expect(matchesPattern('shell:kill', '/^shell:(exec|spawn)$/')).toBe(false);
    });

    it('matches regex: prefixed pattern', () => {
      expect(matchesPattern('db:postgres:drop', 'regex:^db:(postgres|mysql):.*$')).toBe(true);
      expect(matchesPattern('db:mysql:query', 'regex:^db:(postgres|mysql):.*$')).toBe(true);
      expect(matchesPattern('db:sqlite:query', 'regex:^db:(postgres|mysql):.*$')).toBe(false);
    });
  });

  describe('matchesAnyPattern', () => {
    it('returns true if any pattern in the list matches', () => {
      const patterns = ['fs:*', 'regex:^db:.*$', '*_dangerous'];
      expect(matchesAnyPattern('fs:read', patterns)).toBe(true);
      expect(matchesAnyPattern('db:query', patterns)).toBe(true);
      expect(matchesAnyPattern('action_dangerous', patterns)).toBe(true);
      expect(matchesAnyPattern('safe_action', patterns)).toBe(false);
    });

    it('returns false for empty pattern lists', () => {
      expect(matchesAnyPattern('tool', [])).toBe(false);
    });
  });

  describe('compilePattern', () => {
    it('precompiles fast matcher predicate', () => {
      const isFsTool = compilePattern('fs:*');
      expect(isFsTool('fs:read')).toBe(true);
      expect(isFsTool('fs:write')).toBe(true);
      expect(isFsTool('bash:run')).toBe(false);
    });
  });

  describe('Declarative Policy Integration', () => {
    it('enforces bulk policy matching with wildcards in SentinelEngine', async () => {
      const engine = new SentinelEngine();

      engine.injectPolicy({
        version: '1.0',
        rules: [
          {
            id: 'bulk-fs-block',
            name: 'Bulk File System Block',
            category: 'fs',
            priority: 100,
            match: {
              tools: ['fs:*', 'storage:*:delete'],
            },
            action: {
              verdict: 'BLOCK',
              reason: 'File system modifications restricted',
            },
          },
        ],
      });

      // 1. fs:read_file -> BLOCKED
      const r1 = await engine.evaluate({
        id: 'c1',
        toolName: 'fs:read_file',
        category: 'fs',
        params: { path: '/etc/passwd' },
        timestamp: Date.now(),
      });
      expect(r1.verdict).toBe(Verdict.BLOCK);

      // 2. storage:s3:delete -> BLOCKED
      const r2 = await engine.evaluate({
        id: 'c2',
        toolName: 'storage:s3:delete',
        category: 'fs',
        params: { bucket: 'assets' },
        timestamp: Date.now(),
      });
      expect(r2.verdict).toBe(Verdict.BLOCK);

      // 3. shell:exec -> ALLOWED
      const r3 = await engine.evaluate({
        id: 'c3',
        toolName: 'shell:exec',
        category: 'shell',
        params: { cmd: 'ls' },
        timestamp: Date.now(),
      });
      expect(r3.verdict).toBe(Verdict.ALLOW);
    });
  });
});
