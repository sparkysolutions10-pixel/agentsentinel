import { describe, it, expect } from 'vitest';
import { createSorobanDiagnosticEventParserRule } from '../src/web3/soroban_diagnostic_event.js';
import { Verdict } from '../src/types.js';

describe('SorobanDiagnosticEventParserRule', () => {
  it('allows events with normal, non-error diagnostic logs', () => {
    const rule = createSorobanDiagnosticEventParserRule();
    const violation = rule.evaluate({
      toolName: 'soroban_diagnostic_event_parse',
      params: { diagnosticEvents: [{ topics: ['fn_call', 'init'], data: 'ok' }] }
    });
    expect(violation).toBeNull();
  });

  it('blocks when diagnostic event contains panic assertion failure', () => {
    const rule = createSorobanDiagnosticEventParserRule();
    const violation = rule.evaluate({
      toolName: 'soroban_diagnostic_event_parse',
      params: { diagnosticEvents: [{ topics: ['fn_return', 'panic'], data: 'insufficient balance' }] }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('CONTRACT_PANIC_DIAGNOSTIC');
  });
});
