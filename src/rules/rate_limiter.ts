/**
 * AgentSentinel Circular Tool Execution Loop & Rate Limiter Rule.
 * Detects and breaks infinite agent loops, repeated identical tool invocations,
 * and runaway execution spirals in autonomous agents.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface LoopRateLimiterOptions {
  maxConsecutiveIdenticalCalls?: number;
  slidingWindowMs?: number;
  maxCallsPerWindow?: number;
  action?: 'BLOCK' | 'CONFIRM';
  ignoreTools?: string[];
}

export interface ToolCallFingerprintRecord {
  toolName: string;
  fingerprint: string;
  timestamp: number;
}

/**
 * Deterministically serializes parameters into a canonical JSON string for fingerprinting.
 */
export function canonicalizeParams(params: Record<string, any>): string {
  if (!params || typeof params !== 'object') {
    return String(params);
  }

  const sortKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortKeys);
    }
    if (obj !== null && typeof obj === 'object') {
      const sorted: Record<string, any> = {};
      Object.keys(obj)
        .sort()
        .forEach((k) => {
          sorted[k] = sortKeys(obj[k]);
        });
      return sorted;
    }
    return obj;
  };

  try {
    return JSON.stringify(sortKeys(params));
  } catch {
    return String(params);
  }
}

export class ToolLoopRateLimiter {
  private maxConsecutive: number;
  private slidingWindowMs: number;
  private maxPerWindow: number;
  private action: 'BLOCK' | 'CONFIRM';
  private ignoreTools: Set<string>;

  private lastFingerprint: string = '';
  private consecutiveCount: number = 0;
  private callHistory: Map<string, number[]> = new Map();

  constructor(options: LoopRateLimiterOptions = {}) {
    this.maxConsecutive = options.maxConsecutiveIdenticalCalls ?? 5;
    this.slidingWindowMs = options.slidingWindowMs ?? 60_000;
    this.maxPerWindow = options.maxCallsPerWindow ?? 30;
    this.action = options.action ?? 'BLOCK';
    this.ignoreTools = new Set(options.ignoreTools ?? ['ping', 'heartbeat']);
  }

  /**
   * Resets internal tracking history.
   */
  public reset(): void {
    this.lastFingerprint = '';
    this.consecutiveCount = 0;
    this.callHistory.clear();
  }

  /**
   * Evaluates a tool call context against loop and rate limits.
   */
  public evaluateContext(ctx: ToolCallContext): RuleViolation | null {
    if (this.ignoreTools.has(ctx.toolName)) {
      return null;
    }

    const canonical = canonicalizeParams(ctx.params);
    const key = `${ctx.toolName}::${canonical}`;
    const now = ctx.timestamp || Date.now();

    // 1. Consecutive identical call check
    if (key === this.lastFingerprint) {
      this.consecutiveCount++;
    } else {
      this.lastFingerprint = key;
      this.consecutiveCount = 1;
    }

    if (this.consecutiveCount >= this.maxConsecutive) {
      const verdict = this.action === 'CONFIRM' ? Verdict.CONFIRM : Verdict.BLOCK;
      return {
        ruleId: 'rule-loop-rate-limiter',
        ruleName: 'Tool Loop & Runaway Execution Rate Limiter',
        severity: 'critical',
        verdict,
        reason: `Circular tool execution loop detected: tool "${ctx.toolName}" was called with identical arguments ${this.consecutiveCount} times consecutively (limit: ${this.maxConsecutive}).`,
      };
    }

    // 2. Sliding window frequency check
    let timestamps = this.callHistory.get(key);
    if (!timestamps) {
      timestamps = [];
      this.callHistory.set(key, timestamps);
    }

    // Prune expired timestamps
    const windowStart = now - this.slidingWindowMs;
    const recent = timestamps.filter((t) => t >= windowStart);
    recent.push(now);
    this.callHistory.set(key, recent);

    if (recent.length > this.maxPerWindow) {
      const verdict = this.action === 'CONFIRM' ? Verdict.CONFIRM : Verdict.BLOCK;
      return {
        ruleId: 'rule-loop-rate-limiter',
        ruleName: 'Tool Loop & Runaway Execution Rate Limiter',
        severity: 'high',
        verdict,
        reason: `Execution rate limit exceeded: tool "${ctx.toolName}" called ${recent.length} times within ${this.slidingWindowMs}ms window (limit: ${this.maxPerWindow}).`,
      };
    }

    return null;
  }

  /**
   * Creates an AgentSentinel SentinelRule for loop rate limiting.
   */
  public createSentinelRule(): SentinelRule {
    return {
      id: 'rule-loop-rate-limiter',
      name: 'Tool Loop & Runaway Execution Rate Limiter',
      category: 'custom',
      priority: 980,
      enabled: true,
      evaluate: (ctx: ToolCallContext): RuleViolation | null => {
        return this.evaluateContext(ctx);
      },
    };
  }
}

/**
 * Convenience helper creating the standard rate limiter rule.
 */
export function createLoopRateLimiterRule(options?: LoopRateLimiterOptions): SentinelRule {
  const limiter = new ToolLoopRateLimiter(options);
  return limiter.createSentinelRule();
}

export const loopRateLimiterRule: SentinelRule = createLoopRateLimiterRule();
