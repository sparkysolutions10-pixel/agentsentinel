import { describe, it, expect } from 'vitest';
import { OpenTelemetryTraceFormatter } from '../src/utils/opentelemetry_trace_formatter.js';

describe('OpenTelemetryTraceFormatter', () => {
  it('generates valid compliant W3C traceparent header', () => {
    const header = OpenTelemetryTraceFormatter.createTraceparent({ sampled: true });
    expect(header).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
  });

  it('parses valid traceparent header accurately', () => {
    const header = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
    const parsed = OpenTelemetryTraceFormatter.parseTraceparent(header);

    expect(parsed).toEqual({
      version: '00',
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      parentId: '00f067aa0ba902b7',
      traceFlags: '01',
      isSampled: true
    });
  });

  it('rejects all-zeros traceId or parentId according to W3C spec', () => {
    const badTrace = '00-00000000000000000000000000000000-00f067aa0ba902b7-01';
    const badParent = '00-4bf92f3577b34da6a3ce929d0e0e4736-0000000000000000-01';

    expect(OpenTelemetryTraceFormatter.parseTraceparent(badTrace)).toBeNull();
    expect(OpenTelemetryTraceFormatter.parseTraceparent(badParent)).toBeNull();
  });

  it('rejects version ff', () => {
    const badVersion = 'ff-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
    expect(OpenTelemetryTraceFormatter.parseTraceparent(badVersion)).toBeNull();
  });
});
