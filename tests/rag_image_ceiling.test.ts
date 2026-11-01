import { describe, it, expect } from 'vitest';
import { createImagePayloadCeilingGuardRule } from '../src/rag/image_payload_ceiling_guard.js';
import { Verdict } from '../src/types.js';

describe('ImagePayloadCeilingGuard', () => {
  const rule = createImagePayloadCeilingGuardRule(4096, 10485760);

  it('allows standard resolution images (1920x1080)', () => {
    const violation = rule.evaluate({ toolName: 'image_process', params: { width: 1920, height: 1080, sizeBytes: 2000000 } });
    expect(violation).toBeNull();
  });

  it('blocks 100-megapixel memory bomb images', () => {
    const violation = rule.evaluate({ toolName: 'image_process', params: { width: 10000, height: 10000 } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });

  it('blocks oversized byte payloads > 10MB', () => {
    const violation = rule.evaluate({ toolName: 'image_process', params: { sizeBytes: 50000000 } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
