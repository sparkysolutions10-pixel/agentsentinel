import { describe, it, expect } from 'vitest';
import { createSemanticAnomalyTripwireRule } from '../src/rag/semantic_anomaly_tripwire.js';
import { Verdict } from '../src/types.js';

describe('SemanticAnomalyTripwire', () => {
  const rule = createSemanticAnomalyTripwireRule();

  it('allows normal semantic distance scores', () => {
    const violation = rule.evaluate({ toolName: 'rag_query', params: { distance: 0.42 } });
    expect(violation).toBeNull();
  });

  it('blocks negative distance scores beyond min threshold', () => {
    const violation = rule.evaluate({ toolName: 'rag_query', params: { distance: -10.5 } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });

  it('blocks abnormally large distance scores', () => {
    const violation = rule.evaluate({ toolName: 'rag_query', params: { score: 999.0 } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
