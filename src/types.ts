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

export interface EvaluationResult {
  verdict: Verdict;
  allowed: boolean;
  violations: RuleViolation[];
  latencyMs: number;
  redactedParams?: Record<string, any>;
}

export interface SentinelRule {
  id: string;
  name: string;
  category: ToolCategory;
  priority: number; // Higher number = executed earlier
  enabled: boolean;
  evaluate(context: ToolCallContext): Promise<RuleViolation | null> | RuleViolation | null;
}
