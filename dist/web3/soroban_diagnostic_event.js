/**
 * AgentSentinel - Soroban Contract Diagnostic Event Parser and Filter
 * Parses diagnostic events emitted during Soroban contract simulation and execution
 * to extract structured error codes, revert reasons, and panic triggers.
 */
import { Verdict } from '../types.js';
export function createSorobanDiagnosticEventParserRule(config = {}) {
    const blockOnPanic = config.blockOnPanic ?? true;
    return {
        id: 'soroban-diagnostic-event-parser',
        name: 'Soroban Diagnostic Event Parser',
        category: 'custom',
        priority: 86,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('soroban') && !tool.includes('diagnostic') && !tool.includes('event')) {
                return null;
            }
            const params = context.params || {};
            const events = Array.isArray(params.diagnosticEvents || params.events) ? (params.diagnosticEvents || params.events) : [];
            for (const ev of events) {
                const topics = Array.isArray(ev.topics) ? ev.topics.map((t) => String(t)) : [];
                const isPanic = topics.some((t) => t.toLowerCase().includes('panic') || t.toLowerCase().includes('error') || t.toLowerCase().includes('assert'));
                const revertReason = ev.data || ev.revertReason || ev.message || 'Unknown panic';
                if (isPanic) {
                    return {
                        ruleId: 'soroban-diagnostic-event-parser',
                        ruleName: 'Soroban Diagnostic Event Parser',
                        severity: 'critical',
                        verdict: blockOnPanic ? Verdict.BLOCK : Verdict.CONFIRM,
                        reason: `Contract execution triggered panic or assertion failure: "${revertReason}".`,
                        detectedPattern: `CONTRACT_PANIC_DIAGNOSTIC:${revertReason}`,
                    };
                }
            }
            return null;
        }
    };
}
//# sourceMappingURL=soroban_diagnostic_event.js.map