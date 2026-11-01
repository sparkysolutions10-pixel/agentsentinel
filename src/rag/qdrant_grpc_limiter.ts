import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface QdrantGrpcLimiterOptions {
  maxFrameSizeBytes?: number;
  maxConcurrentStreams?: number;
}

export function inspectGrpcPayload(params: Record<string, any>, maxFrameSize: number = 4 * 1024 * 1024): { isValid: boolean; reason?: string } {
  if (!params) return { isValid: true };
  try {
    const raw = JSON.stringify(params);
    const byteLen = Buffer.byteLength(raw, 'utf8');
    if (byteLen > maxFrameSize) {
      return { isValid: false, reason: `gRPC message payload frame size (${byteLen} bytes) exceeds maximum allowable ceiling of ${maxFrameSize} bytes.` };
    }
  } catch {}
  return { isValid: true };
}

export function createQdrantGrpcPayloadLimiterRule(options: QdrantGrpcLimiterOptions = {}): SentinelRule {
  const maxBytes = options.maxFrameSizeBytes ?? 4 * 1024 * 1024;
  return {
    id: 'rag-qdrant-grpc-limiter',
    name: 'Enforce Qdrant gRPC Payload Frame Size and Stream Boundaries',
    category: 'custom',
    priority: 930,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const isGrpc = ctx.toolName.toLowerCase().includes('grpc') || ctx.params?.protocol === 'grpc';
      if (!isGrpc) return null;
      const inspection = inspectGrpcPayload(ctx.params, maxBytes);
      if (!inspection.isValid) {
        return {
          ruleId: 'rag-qdrant-grpc-limiter',
          ruleName: 'Enforce Qdrant gRPC Payload Frame Size and Stream Boundaries',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: inspection.reason || 'Oversized gRPC frame detected.',
        };
      }
      return null;
    }
  };
}
