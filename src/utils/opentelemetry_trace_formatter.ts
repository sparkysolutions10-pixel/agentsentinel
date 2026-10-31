import crypto from 'crypto';

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

export class OpenTelemetryTraceFormatter {
  private static readonly TRACE_REGEX = /^([0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;

  public static isValidTraceId(traceId: string): boolean {
    if (!/^[0-9a-f]{32}$/.test(traceId)) return false;
    return traceId !== '00000000000000000000000000000000';
  }

  public static isValidSpanId(spanId: string): boolean {
    if (!/^[0-9a-f]{16}$/.test(spanId)) return false;
    return spanId !== '0000000000000000';
  }

  public static createTraceparent(options?: {
    traceId?: string;
    spanId?: string;
    sampled?: boolean;
  }): string {
    const version = '00';
    const traceId = options?.traceId ?? crypto.randomBytes(16).toString('hex');
    const spanId = options?.spanId ?? crypto.randomBytes(8).toString('hex');
    const sampled = options?.sampled ?? false;
    const flags = sampled ? '01' : '00';

    if (!this.isValidTraceId(traceId)) {
      throw new Error(`Invalid traceId: ${traceId}`);
    }
    if (!this.isValidSpanId(spanId)) {
      throw new Error(`Invalid spanId: ${spanId}`);
    }

    return `${version}-${traceId}-${spanId}-${flags}`;
  }

  public static parseTraceparent(header: string): ParsedTraceparent | null {
    if (!header || typeof header !== 'string') return null;
    const match = header.trim().match(this.TRACE_REGEX);
    if (!match) return null;

    const [, version, traceId, parentId, traceFlags] = match;

    if (version === 'ff') return null;
    if (!this.isValidTraceId(traceId)) return null;
    if (!this.isValidSpanId(parentId)) return null;

    const flagNum = parseInt(traceFlags, 16);
    const isSampled = (flagNum & 0x01) === 1;

    return {
      version,
      traceId,
      parentId,
      traceFlags,
      isSampled
    };
  }
}
