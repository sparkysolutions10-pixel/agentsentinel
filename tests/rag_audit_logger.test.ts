import { describe, it, expect } from 'vitest';
import { createRagAuditLoggerRule } from '../src/rag/rag_audit_logger.js';
import { Verdict } from '../src/types.js';

describe('RagAuditLogger', () => {
  const rule = createRagAuditLoggerRule();

  it('allows vector operations with active audit logging', () => {
    const violation = rule.evaluate({ toolName: 'vector_search', params: { query: 'legal docs' } });
    expect(violation).toBeNull();
  });

  it('blocks vector operations attempting to disable audit log', () => {
    const violation = rule.evaluate({ toolName: 'vector_search', params: { disableAuditLog: true } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
