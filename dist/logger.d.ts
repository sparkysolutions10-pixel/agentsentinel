import { RuleViolation, ToolCallContext, Verdict, ToolCategory } from './types.js';
export interface AuditEvent {
    eventId: string;
    timestamp: string;
    agentId?: string;
    toolName: string;
    category?: ToolCategory;
    verdict: Verdict;
    severity: 'low' | 'medium' | 'high' | 'critical';
    ruleId: string;
    ruleName: string;
    reason: string;
    detectedPattern?: string;
    params: Record<string, any>;
    latencyMs: number;
    signature?: string;
}
export type AuditEventSink = (event: AuditEvent, formattedJson: string) => void;
/**
 * Structured JSON violation audit logger backed by a memory-bounded sliding window queue.
 */
export declare class JSONAuditLogger {
    private events;
    private sink?;
    private hmacKey?;
    constructor(sink?: AuditEventSink, hmacKey?: string, capacity?: number);
    /**
     * Sets or updates the HMAC secret key for tamper-proof log signing.
     */
    setHmacKey(key: string): this;
    /**
     * Records a security violation event and returns the structured AuditEvent.
     */
    log(violation: RuleViolation, context: ToolCallContext, latencyMs?: number): AuditEvent;
    /**
     * Formats an AuditEvent into a standardized single-line JSON string.
     */
    format(event: AuditEvent): string;
    /**
     * Returns all recorded audit events in chronological order.
     */
    getEvents(): AuditEvent[];
    /**
     * Alias for getEvents() returning recent audit events in chronological order.
     */
    getRecentEvents(): AuditEvent[];
    /**
     * Clears in-memory audit events.
     */
    clear(): void;
    /**
     * Returns the count of recorded audit events currently held in memory.
     */
    get size(): number;
    /**
     * Returns the count of dropped events due to buffer overflow.
     */
    get droppedCount(): number;
}
//# sourceMappingURL=logger.d.ts.map