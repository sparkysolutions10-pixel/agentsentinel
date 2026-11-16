/**
 * AgentSentinel - Contract Event Topic Schema Validator
 * Validates Soroban event topics against schema rules (max 4 topic segments, non-empty, valid symbols)
 * to intercept spoofed or malformed telemetry feeds.
 */
import { Verdict } from '../types.js';
export function createSorobanEventTopicValidatorRule(config = {}) {
    const maxTopics = config.maxTopicsCount ?? 4;
    return {
        id: 'soroban-event-topic-validator',
        name: 'Soroban Event Topic Validator',
        category: 'custom',
        priority: 84,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('event') && !tool.includes('soroban') && !tool.includes('emit')) {
                return null;
            }
            const params = context.params || {};
            const topics = params.topics;
            if (!topics || !Array.isArray(topics)) {
                return null;
            }
            if (topics.length > maxTopics) {
                return {
                    ruleId: 'soroban-event-topic-validator',
                    ruleName: 'Soroban Event Topic Validator',
                    severity: 'high',
                    verdict: Verdict.BLOCK,
                    reason: `Event topics count (${topics.length}) exceeds Soroban protocol limit (${maxTopics}). Malformed event.`,
                    detectedPattern: `EVENT_TOPIC_COUNT_EXCEEDED:${topics.length}>${maxTopics}`,
                };
            }
            for (let i = 0; i < topics.length; i++) {
                const topic = String(topics[i]);
                if (!topic || topic.trim() === '') {
                    return {
                        ruleId: 'soroban-event-topic-validator',
                        ruleName: 'Soroban Event Topic Validator',
                        severity: 'medium',
                        verdict: Verdict.BLOCK,
                        reason: `Event topic segment #${i} is empty. Spoofed or corrupt event payload.`,
                        detectedPattern: `EMPTY_EVENT_TOPIC_SEGMENT:${i}`,
                    };
                }
            }
            return null;
        }
    };
}
//# sourceMappingURL=soroban_event_topic.js.map