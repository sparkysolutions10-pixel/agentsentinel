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
import { createHash } from 'node:crypto';
export class BlackboxFlightRecorder {
    agentIdentifier;
    entries = [];
    genesisHash = '0'.repeat(64);
    isSealed = false;
    constructor(agentIdentifier = 'agent-default') {
        this.agentIdentifier = agentIdentifier;
    }
    /**
     * Appends an event to the cryptographic blackbox flight recorder.
     */
    recordEvent(eventType, payload, agentId) {
        if (this.isSealed) {
            throw new Error('BlackboxFlightRecorder is sealed. No further entries can be recorded.');
        }
        const sequence = this.entries.length + 1;
        const timestamp = new Date().toISOString();
        const resolvedAgentId = agentId || this.agentIdentifier;
        const prevHash = this.entries.length === 0 ? this.genesisHash : this.entries[this.entries.length - 1].entryHash;
        const rawPayloadString = JSON.stringify(payload, Object.keys(payload).sort());
        const hashInput = `${sequence}|${timestamp}|${resolvedAgentId}|${eventType}|${rawPayloadString}|${prevHash}`;
        const entryHash = createHash('sha256').update(hashInput).digest('hex');
        const entry = {
            sequence,
            timestamp,
            agentId: resolvedAgentId,
            eventType,
            payload,
            prevHash,
            entryHash,
        };
        this.entries.push(entry);
        return entry;
    }
    /**
     * Verifies the cryptographic integrity of the entire recorded chain.
     */
    verifyIntegrity() {
        if (this.entries.length === 0) {
            return {
                isValid: true,
                totalEntries: 0,
                merkleRoot: this.genesisHash,
            };
        }
        let expectedPrevHash = this.genesisHash;
        for (let i = 0; i < this.entries.length; i++) {
            const entry = this.entries[i];
            if (entry.sequence !== i + 1) {
                return {
                    isValid: false,
                    totalEntries: this.entries.length,
                    merkleRoot: '',
                    corruptedAtSequence: entry.sequence,
                    reason: `Sequence gap detected: expected ${i + 1}, found ${entry.sequence}`,
                };
            }
            if (entry.prevHash !== expectedPrevHash) {
                return {
                    isValid: false,
                    totalEntries: this.entries.length,
                    merkleRoot: '',
                    corruptedAtSequence: entry.sequence,
                    reason: `Hash chain broken at sequence ${entry.sequence}: previous hash mismatch`,
                };
            }
            const rawPayloadString = JSON.stringify(entry.payload, Object.keys(entry.payload).sort());
            const hashInput = `${entry.sequence}|${entry.timestamp}|${entry.agentId}|${entry.eventType}|${rawPayloadString}|${entry.prevHash}`;
            const recomputedHash = createHash('sha256').update(hashInput).digest('hex');
            if (entry.entryHash !== recomputedHash) {
                return {
                    isValid: false,
                    totalEntries: this.entries.length,
                    merkleRoot: '',
                    corruptedAtSequence: entry.sequence,
                    reason: `Entry payload tampering detected at sequence ${entry.sequence}`,
                };
            }
            expectedPrevHash = entry.entryHash;
        }
        return {
            isValid: true,
            totalEntries: this.entries.length,
            merkleRoot: this.computeMerkleRoot(),
        };
    }
    /**
     * Computes the top-level Merkle root over all recorded entries.
     */
    computeMerkleRoot() {
        if (this.entries.length === 0) {
            return this.genesisHash;
        }
        let currentLevel = this.entries.map((e) => e.entryHash);
        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
                const combined = createHash('sha256').update(left + right).digest('hex');
                nextLevel.push(combined);
            }
            currentLevel = nextLevel;
        }
        return currentLevel[0];
    }
    /**
     * Exports a forensic audit report in JSON or clean GitHub Flavored Markdown.
     */
    exportForensicLog(format = 'json') {
        if (format === 'json') {
            return JSON.stringify({
                agent: this.agentIdentifier,
                merkleRoot: this.computeMerkleRoot(),
                integrity: this.verifyIntegrity().isValid,
                totalEntries: this.entries.length,
                entries: this.entries,
            }, null, 2);
        }
        const lines = [
            `# AgentSentinel Forensic Flight Record`,
            `**Agent ID:** \`${this.agentIdentifier}\``,
            `**Total Entries:** ${this.entries.length}`,
            `**Merkle Root:** \`${this.computeMerkleRoot()}\``,
            `**Integrity Status:** ${this.verifyIntegrity().isValid ? '🟢 VERIFIED INTACT' : '🔴 TAMPER DETECTED'}`,
            '',
            '| Seq | Timestamp | Type | Details | Entry Hash |',
            '|---|---|---|---|---|',
        ];
        for (const e of this.entries) {
            const summary = JSON.stringify(e.payload).replace(/\|/g, '\\|').slice(0, 60);
            lines.push(`| ${e.sequence} | ${e.timestamp} | \`${e.eventType}\` | ${summary} | \`${e.entryHash.slice(0, 10)}...\` |`);
        }
        return lines.join('\n');
    }
    getEntryCount() {
        return this.entries.length;
    }
    getEntries() {
        return Object.freeze([...this.entries]);
    }
    seal() {
        this.isSealed = true;
    }
}
//# sourceMappingURL=blackbox_flight_recorder.js.map