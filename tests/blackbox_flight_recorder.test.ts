import { describe, it, expect } from 'vitest';
import { BlackboxFlightRecorder, BlackboxEntry } from '../src/mcp/blackbox_flight_recorder.js';

describe('BlackboxFlightRecorder', () => {
  it('should initialize with an empty log and genesis parent hash', () => {
    const recorder = new BlackboxFlightRecorder('test-agent');
    expect(recorder.getEntryCount()).toBe(0);
    const verification = recorder.verifyIntegrity();
    expect(verification.isValid).toBe(true);
    expect(verification.totalEntries).toBe(0);
  });

  it('should append events with monotonic sequences and linked SHA-256 hashes', () => {
    const recorder = new BlackboxFlightRecorder('agent-alpha');
    const entry1 = recorder.recordEvent('prompt', { text: 'What is Stellar?' });
    const entry2 = recorder.recordEvent('tool_call', { tool: 'search', query: 'Stellar' });
    const entry3 = recorder.recordEvent('policy_decision', { allowed: true });

    expect(entry1.sequence).toBe(1);
    expect(entry2.sequence).toBe(2);
    expect(entry3.sequence).toBe(3);

    expect(entry1.prevHash).toBe('0'.repeat(64));
    expect(entry2.prevHash).toBe(entry1.entryHash);
    expect(entry3.prevHash).toBe(entry2.entryHash);

    const verification = recorder.verifyIntegrity();
    expect(verification.isValid).toBe(true);
    expect(verification.totalEntries).toBe(3);
    expect(verification.merkleRoot).toBeDefined();
  });

  it('should detect tampering if an event hash is corrupted', () => {
    const recorder = new BlackboxFlightRecorder('tamper-agent');
    recorder.recordEvent('prompt', { message: 'Transfer $10' });
    recorder.recordEvent('tool_call', { amount: 10 });

    // Mutate internal entries array for tampering test
    const entries = (recorder as unknown as { entries: BlackboxEntry[] }).entries;
    entries[0].entryHash = 'deadbeef'.repeat(8);

    const verification = recorder.verifyIntegrity();
    expect(verification.isValid).toBe(false);
    expect(verification.corruptedAtSequence).toBe(1);
    expect(verification.reason).toContain('tampering');
  });

  it('should detect tampering if an event payload is modified', () => {
    const recorder = new BlackboxFlightRecorder('tamper-agent-payload');
    recorder.recordEvent('prompt', { message: 'Transfer $10' });

    const entries = (recorder as unknown as { entries: BlackboxEntry[] }).entries;
    entries[0].payload = { message: 'Transfer $10,000,000' };

    const verification = recorder.verifyIntegrity();
    expect(verification.isValid).toBe(false);
    expect(verification.corruptedAtSequence).toBe(1);
  });

  it('should export forensic logs in JSON and Markdown formats', () => {
    const recorder = new BlackboxFlightRecorder('reporter-agent');
    recorder.recordEvent('prompt', { input: 'Analyze contract' });
    recorder.recordEvent('tool_result', { status: 'OK' });

    const jsonExport = recorder.exportForensicLog('json');
    const parsed = JSON.parse(jsonExport);
    expect(parsed.agent).toBe('reporter-agent');
    expect(parsed.totalEntries).toBe(2);
    expect(parsed.integrity).toBe(true);

    const mdExport = recorder.exportForensicLog('markdown');
    expect(mdExport).toContain('# AgentSentinel Forensic Flight Record');
    expect(mdExport).toContain('reporter-agent');
    expect(mdExport).toContain('Analyze contract');
  });
});
