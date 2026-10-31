/**
 * AgentSentinel - RFC 5424 Syslog Standard Formatter
 * Produces structured audit log lines adhering to RFC 5424 specifications
 * for direct ingestion into Splunk, Datadog, and enterprise SIEM platforms.
 */

import { EvaluationResult, ToolCallContext } from '../types.js';

export class SyslogStandardFormatter {
  public static format(
    toolCall: ToolCallContext,
    evaluation: EvaluationResult,
    hostname = 'agentsentinel.local'
  ): string {
    const pri = evaluation.allowed ? 134 : 131; // Local0 Notice vs Local0 Error
    const timestamp = new Date(toolCall.timestamp || Date.now()).toISOString();
    const appName = 'AgentSentinel';
    const procId = process.pid.toString();
    const msgId = evaluation.verdict;
    const msg = `tool=${toolCall.toolName} allowed=${evaluation.allowed} violations=${evaluation.violations.length}`;

    return `<${pri}>1 ${timestamp} ${hostname} ${appName} ${procId} ${msgId} - ${msg}`;
  }
}
