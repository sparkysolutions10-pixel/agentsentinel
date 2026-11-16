/**
 * OpenTelemetryTraceFormatter - W3C Trace Context parser and header generator.
 */
export interface ParsedTraceparent {
    version: string;
    traceId: string;
    parentId: string;
    traceFlags: string;
    isSampled: boolean;
}
export declare class OpenTelemetryTraceFormatter {
    private static readonly TRACE_REGEX;
    static isValidTraceId(traceId: string): boolean;
    static isValidSpanId(spanId: string): boolean;
    static createTraceparent(options?: {
        traceId?: string;
        spanId?: string;
        sampled?: boolean;
    }): string;
    static parseTraceparent(header: string): ParsedTraceparent | null;
}
//# sourceMappingURL=opentelemetry_trace_formatter.d.ts.map