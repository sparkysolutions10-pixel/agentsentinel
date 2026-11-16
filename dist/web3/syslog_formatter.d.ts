/**
 * AgentSentinel - RFC 5424 Syslog Standard Formatter
 * Produces structured audit log lines adhering to RFC 5424 specifications
 * for direct ingestion into Splunk, Datadog, and enterprise SIEM platforms.
 */
import { EvaluationResult, ToolCallContext } from '../types.js';
export declare class SyslogStandardFormatter {
    static format(toolCall: ToolCallContext, evaluation: EvaluationResult, hostname?: string): string;
}
//# sourceMappingURL=syslog_formatter.d.ts.map