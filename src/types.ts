/**
 * AgentSentinel - Core Type Definitions
 * Zero-trust runtime security firewall and AST policy interceptor for AI agents & MCP.
 */

export enum Verdict {
  ALLOW = 'ALLOW',
  BLOCK = 'BLOCK',
  REDACT = 'REDACT',
  CONFIRM = 'CONFIRM'
}

/**
 * Type guard checking if an arbitrary value matches a valid Verdict enum.
 */
export function isVerdict(value: unknown): value is Verdict {
  return typeof value === 'string' && Object.values(Verdict).includes(value as Verdict);
}

/**
 * Asserts that a value is a valid Verdict enum, throwing TypeError otherwise.
 */
export function assertVerdict(value: unknown): asserts value is Verdict {
  if (!isVerdict(value)) {
    throw new TypeError(`[AgentSentinel] Invalid verdict value: "${String(value)}". Expected ALLOW, BLOCK, REDACT, or CONFIRM.`);
  }
}

/**
 * Safely parses any case-insensitive string or value into a standardized Verdict enum.
 */
export function parseVerdict(value: unknown, fallback: Verdict = Verdict.BLOCK): Verdict {
  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase();
    if (isVerdict(normalized)) {
      return normalized as Verdict;
    }
  }
  return fallback;
}

/**
 * Numeric priority ranking of verdicts (higher number = more restrictive).
 */
export function getVerdictRank(verdict: Verdict): number {
  switch (verdict) {
    case Verdict.BLOCK:
      return 4;
    case Verdict.CONFIRM:
      return 3;
    case Verdict.REDACT:
      return 2;
    case Verdict.ALLOW:
      return 1;
    default:
      return 0;
  }
}

export type ToolCategory = 'shell' | 'sql' | 'fs' | 'secrets' | 'network' | 'custom';

export interface ToolCallContext {
  id: string;
  agentId?: string;
  toolName: string;
  category?: ToolCategory;
  params: Record<string, any>;
  timestamp: number;
}

export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  verdict: Verdict;
  reason: string;
  detectedPattern?: string;
  redactedParams?: Record<string, any>;
}

export interface ConfirmDecision {
  requestId: string;
  approved: boolean;
  verdict: Verdict;
  reason?: string;
  timedOut: boolean;
  latencyMs: number;
}

export interface ConfirmRequestSummary {
  requestId: string;
  toolCallId: string;
  toolName: string;
  category?: ToolCategory;
  params: Record<string, any>;
  ruleId?: string;
  reason?: string;
  prompt: string;
  createdAt: number;
  timeoutMs: number;
}

export interface EvaluateOptions {
  dryRun?: boolean;
}

export interface EvaluationResult {
  verdict: Verdict;
  allowed: boolean;
  violations: RuleViolation[];
  latencyMs: number;
  redactedParams?: Record<string, any>;
  confirmDecision?: ConfirmDecision;
  dryRun?: boolean;
  simulatedVerdict?: Verdict;
}

export interface SentinelRule {
  id: string;
  name: string;
  category: ToolCategory;
  priority: number; // Higher number = executed earlier
  enabled: boolean;
  evaluate(context: ToolCallContext): Promise<RuleViolation | null> | RuleViolation | null;
}

export type BeforeExecuteHook = (context: ToolCallContext) => Promise<ToolCallContext | void> | ToolCallContext | void;
export type AfterExecuteHook = (context: ToolCallContext, result: EvaluationResult) => Promise<void> | void;
export type OnViolationHook = (violation: RuleViolation, context: ToolCallContext) => Promise<void> | void;
