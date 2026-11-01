import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createImagePayloadCeilingGuardRule(maxDim: number = 4096, maxBytes: number = 10 * 1024 * 1024): SentinelRule {
  return {
    id: 'rag-image-payload-ceiling-guard',
    name: 'Clamp Image Resolution and Byte Payload Ceiling',
    category: 'custom',
    priority: 860,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const width = Number(ctx.params?.width);
      const height = Number(ctx.params?.height);
      const sizeBytes = Number(ctx.params?.sizeBytes || ctx.params?.byteLength);

      if ((width && width > maxDim) || (height && height > maxDim)) {
        return {
          ruleId: 'rag-image-payload-ceiling-guard',
          ruleName: 'Clamp Image Resolution and Byte Payload Ceiling',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Image resolution ${width}x${height} exceeds allowed maximum dimension of ${maxDim}px.`,
          detectedPattern: `excessive-resolution=${width}x${height}`,
        };
      }

      if (sizeBytes && sizeBytes > maxBytes) {
        return {
          ruleId: 'rag-image-payload-ceiling-guard',
          ruleName: 'Clamp Image Resolution and Byte Payload Ceiling',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Image byte size ${sizeBytes} exceeds maximum payload boundary of ${maxBytes} bytes.`,
          detectedPattern: `payload-bytes-overflow=${sizeBytes}`,
        };
      }

      return null;
    }
  };
}
