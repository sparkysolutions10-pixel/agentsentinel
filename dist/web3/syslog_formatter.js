/**
 * AgentSentinel - RFC 5424 Syslog Standard Formatter
 * Produces structured audit log lines adhering to RFC 5424 specifications
 * for direct ingestion into Splunk, Datadog, and enterprise SIEM platforms.
 */
export class SyslogStandardFormatter {
    static format(toolCall, evaluation, hostname = 'agentsentinel.local') {
        const pri = evaluation.allowed ? 134 : 131; // Local0 Notice vs Local0 Error
        const timestamp = new Date(toolCall.timestamp || Date.now()).toISOString();
        const appName = 'AgentSentinel';
        const procId = process.pid.toString();
        const msgId = evaluation.verdict;
        const msg = `tool=${toolCall.toolName} allowed=${evaluation.allowed} violations=${evaluation.violations.length}`;
        return `<${pri}>1 ${timestamp} ${hostname} ${appName} ${procId} ${msgId} - ${msg}`;
    }
}
//# sourceMappingURL=syslog_formatter.js.map