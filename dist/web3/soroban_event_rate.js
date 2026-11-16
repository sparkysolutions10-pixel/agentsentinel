/**
 * AgentSentinel - Anomalous Contract Event Emit Rate Detector
 * Intercepts high-frequency event spam (e.g. hundreds of events emitted in a single transaction)
 * designed to exhaust indexer memory, disrupt RPC nodes, or obfuscate exploit calls.
 */
import { Verdict } from '../types.js';
export function createSorobanEventRateDetectorRule(config = {}) {
    const maxEvents = config.maxEventsPerTransaction ?? 20;
    return {
        id: 'soroban-event-rate-detector',
        name: 'Soroban Event Rate Spammer Detector',
        category: 'custom',
        priority: 81,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('event') && !tool.includes('soroban') && !tool.includes('tx')) {
                return null;
            }
            const params = context.params || {};
            const eventsCount = Number(params.eventsCount ?? (Array.isArray(params.events) ? params.events.length : 0));
            if (eventsCount > maxEvents) {
                return {
                    ruleId: 'soroban-event-rate-detector',
                    ruleName: 'Soroban Event Rate Spammer Detector',
                    severity: 'high',
                    verdict: Verdict.BLOCK,
                    reason: `Transaction emits an anomalous number of events (${eventsCount} > limit ${maxEvents}). Potential indexer DOS or obfuscation attack.`,
                    detectedPattern: `ANOMALOUS_EVENT_RATE:${eventsCount}>${maxEvents}`,
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=soroban_event_rate.js.map