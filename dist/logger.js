import { randomUUID } from 'node:crypto';
import { signAuditEvent } from './integrity.js';
import { SlidingEventQueue } from './queue.js';
/**
 * Structured JSON violation audit logger backed by a memory-bounded sliding window queue.
 */
export class JSONAuditLogger {
    events;
    sink;
    hmacKey;
    constructor(sink, hmacKey, capacity = 1000) {
        this.sink = sink;
        this.hmacKey = hmacKey;
        this.events = new SlidingEventQueue(capacity);
    }
    /**
     * Sets or updates the HMAC secret key for tamper-proof log signing.
     */
    setHmacKey(key) {
        this.hmacKey = key;
        return this;
    }
    /**
     * Records a security violation event and returns the structured AuditEvent.
     */
    log(violation, context, latencyMs = 0) {
        let event = {
            eventId: randomUUID(),
            timestamp: new Date().toISOString(),
            agentId: context.agentId,
            toolName: context.toolName,
            category: context.category,
            verdict: violation.verdict,
            severity: violation.severity,
            ruleId: violation.ruleId,
            ruleName: violation.ruleName,
            reason: violation.reason,
            detectedPattern: violation.detectedPattern,
            params: { ...context.params },
            latencyMs
        };
        if (this.hmacKey) {
            event = signAuditEvent(event, this.hmacKey);
        }
        this.events.push(event);
        const formatted = this.format(event);
        if (this.sink) {
            try {
                this.sink(event, formatted);
            }
            catch (sinkErr) {
                console.error('[AgentSentinel] Error in audit logger sink:', sinkErr);
            }
        }
        return event;
    }
    /**
     * Formats an AuditEvent into a standardized single-line JSON string.
     */
    format(event) {
        return JSON.stringify(event);
    }
    /**
     * Returns all recorded audit events in chronological order.
     */
    getEvents() {
        return this.events.toArray();
    }
    /**
     * Alias for getEvents() returning recent audit events in chronological order.
     */
    getRecentEvents() {
        return this.getEvents();
    }
    /**
     * Clears in-memory audit events.
     */
    clear() {
        this.events.clear();
    }
    /**
     * Returns the count of recorded audit events currently held in memory.
     */
    get size() {
        return this.events.size;
    }
    /**
     * Returns the count of dropped events due to buffer overflow.
     */
    get droppedCount() {
        return this.events.droppedCount;
    }
}
//# sourceMappingURL=logger.js.map