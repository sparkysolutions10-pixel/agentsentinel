/**
 * AgentSentinel - Soroban Write Bytes Memory Ceiling Guard
 * Restricts maximum contract storage bytes written in a single transaction
 * to protect against state bloat and runaway storage rent charges.
 */
import { Verdict } from '../types.js';
export function createWriteBytesCeilingRule(config = {}) {
    const maxBytes = config.maxWriteBytes ?? 32768;
    return {
        id: 'write-bytes-memory-ceiling',
        name: 'Soroban Write Bytes Memory Ceiling',
        category: 'custom',
        priority: 80,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('soroban') && !tool.includes('invoke') && !tool.includes('write')) {
                return null;
            }
            const params = context.params || {};
            const writeBytes = Number(params.writeBytes ?? params.storageWriteBytes ?? 0);
            if (writeBytes > maxBytes) {
                return {
                    ruleId: 'write-bytes-memory-ceiling',
                    ruleName: 'Soroban Write Bytes Memory Ceiling',
                    severity: 'high',
                    verdict: Verdict.BLOCK,
                    reason: `Storage write footprint (${writeBytes.toLocaleString()} bytes) exceeds write ceiling (${maxBytes.toLocaleString()} bytes). State write rejected.`,
                    detectedPattern: `WRITE_BYTES_CEILING_EXCEEDED:${writeBytes}>${maxBytes}`
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=write_bytes_ceiling.js.map