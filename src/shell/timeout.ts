/**
 * Command Execution Timeout Enforcement Guard.
 * Ensures every shell tool call specifies an explicit timeout parameter
 * to prevent runaway subprocesses, infinite loops, and hung execution threads.
 * Supports auto-injecting default timeout thresholds or strictly blocking unbounded calls.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface TimeoutGuardOptions {
  defaultTimeoutMs?: number;
  maxAllowedTimeoutMs?: number;
  strictBlocking?: boolean;
  timeoutFieldNames?: string[];
}

export interface TimeoutEnforcementResult {
  hasValidTimeout: boolean;
  detectedTimeoutMs?: number;
  injectedTimeoutMs?: number;
  cappedTimeoutMs?: number;
  fieldName?: string;
  actionTaken: 'valid' | 'injected' | 'capped' | 'missing_blocked' | 'oversized_blocked';
  reason?: string;
}

export const DEFAULT_TIMEOUT_FIELDS = [
  'timeout',
  'timeoutMs',
  'timeout_ms',
  'WaitMsBeforeAsync',
  'max_time',
  'maxTime',
];

export const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds
export const DEFAULT_MAX_TIMEOUT_MS = 300000; // 5 minutes

/**
 * Analyzes and sanitizes tool parameters to enforce bounded execution timeouts.
 */
export function enforceCommandTimeout(
  params: Record<string, any>,
  options?: TimeoutGuardOptions
): { result: TimeoutEnforcementResult; updatedParams: Record<string, any> } {
  const fields = options?.timeoutFieldNames || DEFAULT_TIMEOUT_FIELDS;
  const defaultTimeout = options?.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxTimeout = options?.maxAllowedTimeoutMs ?? DEFAULT_MAX_TIMEOUT_MS;
  const isStrict = options?.strictBlocking ?? false;

  const updatedParams = { ...params };
  let foundField: string | null = null;
  let rawValue: any = null;

  for (const field of fields) {
    if (field in params && params[field] !== undefined && params[field] !== null) {
      foundField = field;
      rawValue = params[field];
      break;
    }
  }

  // 1. Missing timeout
  if (foundField === null) {
    if (isStrict) {
      return {
        result: {
          hasValidTimeout: false,
          actionTaken: 'missing_blocked',
          reason: 'Missing required execution timeout parameter; process hung protection violated',
        },
        updatedParams,
      };
    }

    // Auto-inject default timeout
    const injectField = 'timeout';
    updatedParams[injectField] = defaultTimeout;
    return {
      result: {
        hasValidTimeout: true,
        injectedTimeoutMs: defaultTimeout,
        fieldName: injectField,
        actionTaken: 'injected',
        reason: `Missing execution timeout auto-injected with safe default [${defaultTimeout}ms]`,
      },
      updatedParams,
    };
  }

  // Parse numeric timeout
  const parsedVal = typeof rawValue === 'number' ? rawValue : parseInt(String(rawValue), 10);

  // 2. Invalid non-positive timeout
  if (isNaN(parsedVal) || parsedVal <= 0) {
    if (isStrict) {
      return {
        result: {
          hasValidTimeout: false,
          fieldName: foundField,
          actionTaken: 'missing_blocked',
          reason: `Invalid non-positive timeout value in field [${foundField}]: ${String(rawValue)}`,
        },
        updatedParams,
      };
    }

    updatedParams[foundField] = defaultTimeout;
    return {
      result: {
        hasValidTimeout: true,
        injectedTimeoutMs: defaultTimeout,
        fieldName: foundField,
        actionTaken: 'injected',
        reason: `Invalid timeout value auto-sanitized to safe default [${defaultTimeout}ms]`,
      },
      updatedParams,
    };
  }

  // 3. Oversized timeout exceeding ceiling
  if (parsedVal > maxTimeout) {
    if (isStrict) {
      return {
        result: {
          hasValidTimeout: false,
          detectedTimeoutMs: parsedVal,
          fieldName: foundField,
          actionTaken: 'oversized_blocked',
          reason: `Requested timeout [${parsedVal}ms] exceeds ceiling maximum [${maxTimeout}ms]`,
        },
        updatedParams,
      };
    }

    updatedParams[foundField] = maxTimeout;
    return {
      result: {
        hasValidTimeout: true,
        detectedTimeoutMs: parsedVal,
        cappedTimeoutMs: maxTimeout,
        fieldName: foundField,
        actionTaken: 'capped',
        reason: `Requested timeout [${parsedVal}ms] clamped down to maximum threshold [${maxTimeout}ms]`,
      },
      updatedParams,
    };
  }

  // 4. Valid timeout within safe boundaries
  return {
    result: {
      hasValidTimeout: true,
      detectedTimeoutMs: parsedVal,
      fieldName: foundField,
      actionTaken: 'valid',
    },
    updatedParams,
  };
}

/**
 * Creates the standard SentinelRule to enforce bounded command execution timeouts.
 */
export function createTimeoutEnforcementRule(options?: TimeoutGuardOptions): SentinelRule {
  const isStrict = options?.strictBlocking ?? false;

  return {
    id: 'enforce-command-timeout',
    name: 'Enforce Command Execution Timeout Boundaries',
    category: 'shell',
    priority: 880,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      // Apply to shell tools or tools executing commands
      const toolName = (ctx.toolName || '').toLowerCase();
      const isShellTool =
        toolName.includes('bash') ||
        toolName.includes('sh') ||
        toolName.includes('powershell') ||
        toolName.includes('cmd') ||
        toolName.includes('command') ||
        toolName.includes('exec') ||
        ctx.category === 'shell' ||
        typeof ctx.params?.command === 'string' ||
        typeof ctx.params?.cmd === 'string' ||
        typeof ctx.params?.commandLine === 'string';

      if (!isShellTool) {
        return null;
      }

      const { result, updatedParams } = enforceCommandTimeout(ctx.params, options);

      // In strict mode, block violations
      if (isStrict && !result.hasValidTimeout) {
        return {
          ruleId: 'enforce-command-timeout',
          ruleName: 'Enforce Command Execution Timeout Boundaries',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: result.reason || 'Missing or invalid command execution timeout parameter',
        };
      }

      // In auto-inject mode, mutate parameters via REDACT verdict if timeout was modified
      if (result.actionTaken === 'injected' || result.actionTaken === 'capped') {
        return {
          ruleId: 'enforce-command-timeout',
          ruleName: 'Enforce Command Execution Timeout Boundaries',
          severity: 'low',
          verdict: Verdict.REDACT,
          reason: result.reason || 'Command timeout auto-adjusted to safe execution boundaries',
          redactedParams: updatedParams,
        };
      }

      return null;
    },
  };
}

export const timeoutEnforcementRule: SentinelRule = createTimeoutEnforcementRule();
