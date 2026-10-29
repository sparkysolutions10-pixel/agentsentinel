import { randomUUID } from 'node:crypto';
import {
  RuleViolation,
  ToolCallContext,
  Verdict,
  ToolCategory
} from './types.js';
import { signAuditEvent, SignedAuditEvent } from './integrity.js';
import { SlidingEventQueue } from './queue.js';

export interface AuditEvent {
  eventId: string;
  timestamp: string; // ISO 8601
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
export class JSONAuditLogger {
  private events: SlidingEventQueue<AuditEvent>;
  private sink?: AuditEventSink;
  private hmacKey?: string;

  constructor(sink?: AuditEventSink, hmacKey?: string, capacity: number = 1000) {
    this.sink = sink;
    this.hmacKey = hmacKey;
    this.events = new SlidingEventQueue<AuditEvent>(capacity);
  }

  /**
   * Sets or updates the HMAC secret key for tamper-proof log signing.
   */
  public setHmacKey(key: string): this {
    this.hmacKey = key;
    return this;
  }

  /**
   * Records a security violation event and returns the structured AuditEvent.
   */
  public log(violation: RuleViolation, context: ToolCallContext, latencyMs: number = 0): AuditEvent {
    let event: AuditEvent = {
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
      } catch (sinkErr) {
        console.error('[AgentSentinel] Error in audit logger sink:', sinkErr);
      }
    }

    return event;
  }

  /**
   * Formats an AuditEvent into a standardized single-line JSON string.
   */
  public format(event: AuditEvent): string {
    return JSON.stringify(event);
  }

  /**
   * Returns all recorded audit events in chronological order.
   */
  public getEvents(): AuditEvent[] {
    return this.events.toArray();
  }

  /**
   * Clears in-memory audit events.
   */
  public clear(): void {
    this.events.clear();
  }

  /**
   * Returns the count of recorded audit events currently held in memory.
   */
  public get size(): number {
    return this.events.size;
  }

  /**
   * Returns the count of dropped events due to buffer overflow.
   */
  public get droppedCount(): number {
    return this.events.droppedCount;
  }
}
