import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createWeaviateBackupIntegrityRule } from '../src/rag/weaviate_backup_guard.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Weaviate Backup Integrity Guard (#333 & #334)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createWeaviateBackupIntegrityRule());

  it('blocks restore operations lacking verified checksums', async () => {
    const unverifiedCtx: ToolCallContext = {
      id: 'res_1',
      toolName: 'weaviate_restore_backup',
      params: { backup_id: 'snapshot_2026' },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(unverifiedCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('without a verified SHA-256 cryptographic checksum');
  });

  it('allows restore with valid SHA256 checksum', async () => {
    const verifiedCtx: ToolCallContext = {
      id: 'res_2',
      toolName: 'weaviate_restore_backup',
      params: { backup_id: 'snapshot_2026', sha256: 'a'.repeat(64) },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(verifiedCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
