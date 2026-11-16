/**
 * AgentSentinel Blackbox Flight Recorder
 *
 * Cryptographic, append-only, tamper-evident flight recorder for autonomous AI agents.
 * Records every prompt, tool execution, parameter payload, and policy verdict in a
 * cryptographically linked SHA-256 hash chain with instant Merkle root computation.
 *
 * @license MIT
 * @author Sparky Solutions (Mukesh Biswas)
 */
export type BlackboxEventType = 'prompt' | 'tool_call' | 'tool_result' | 'policy_decision' | 'security_alert' | 'system_event';
export interface BlackboxEntry {
    sequence: number;
    timestamp: string;
    agentId: string;
    eventType: BlackboxEventType;
    payload: Record<string, unknown>;
    prevHash: string;
    entryHash: string;
}
export interface IntegrityVerificationResult {
    isValid: boolean;
    totalEntries: number;
    merkleRoot: string;
    corruptedAtSequence?: number;
    reason?: string;
}
export declare class BlackboxFlightRecorder {
    private readonly agentIdentifier;
    private readonly entries;
    private readonly genesisHash;
    private isSealed;
    constructor(agentIdentifier?: string);
    /**
     * Appends an event to the cryptographic blackbox flight recorder.
     */
    recordEvent(eventType: BlackboxEventType, payload: Record<string, unknown>, agentId?: string): BlackboxEntry;
    /**
     * Verifies the cryptographic integrity of the entire recorded chain.
     */
    verifyIntegrity(): IntegrityVerificationResult;
    /**
     * Computes the top-level Merkle root over all recorded entries.
     */
    computeMerkleRoot(): string;
    /**
     * Exports a forensic audit report in JSON or clean GitHub Flavored Markdown.
     */
    exportForensicLog(format?: 'json' | 'markdown'): string;
    getEntryCount(): number;
    getEntries(): readonly BlackboxEntry[];
    seal(): void;
}
//# sourceMappingURL=blackbox_flight_recorder.d.ts.map