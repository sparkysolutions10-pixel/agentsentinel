import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createPqMigrationRule } from '../src/crypto/pq_migration_controller.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Post-Quantum Migration Controller (#823 & #824)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createPqMigrationRule());

  it('rejects deprecated RSA-1024 and RSA-2048 key lengths', async () => {
    const weakCtx: ToolCallContext = {
      id: 'weak_rsa',
      toolName: 'generate_key',
      params: { algorithm: 'RSA', key_size: 2048 },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(weakCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Deprecated cryptographic key length');
  });

  it('allows strong RSA-4096 and ML-KEM keys', async () => {
    const strongCtx: ToolCallContext = {
      id: 'strong_rsa',
      toolName: 'generate_key',
      params: { algorithm: 'RSA', key_size: 4096 },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(strongCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
