/**
 * AgentSentinel - Cursor AI Agent Security Guard Walkthrough
 *
 * Demonstrates integrating AgentSentinel with Cursor AI (Composer & Agent Mode).
 * Cursor AI agent mode executes terminal commands and edits project files autonomously.
 * AgentSentinel provides a pre-execution firewall enforcing workspace confinement,
 * secret leak protection, and blocking destructive bash scripts.
 */

import {
  SentinelEngine,
  createDestructiveDeletionRule,
  createWorkspaceJailGuardRule,
  createGitCIProtectionRule,
  createSensitiveDirectoryBlockerRule,
  createCreditCardScrubberRule,
  Verdict,
  ToolCallContext,
} from '../src/index.js';

export interface CursorToolExecutionRequest {
  tool: 'cursor_terminal' | 'cursor_file_edit' | 'cursor_browser';
  command?: string;
  filePath?: string;
  content?: string;
  url?: string;
}

export interface CursorGuardResponse {
  allow: boolean;
  verdict: Verdict;
  sanitizedPayload?: Record<string, any>;
  warningOrError?: string;
}

/**
 * 1. Creates a specialized Cursor AI Agent Sentinel Engine instance.
 */
export function createCursorAiSentinel(workspaceRoot: string = process.cwd()) {
  const engine = new SentinelEngine();

  // Protect against root wipes and destructive shell scripts
  engine.registerRule(createDestructiveDeletionRule());

  // Enforce that Cursor agent cannot write outside the current workspace
  engine.registerRule(createWorkspaceJailGuardRule({ allowedRoots: [workspaceRoot] }));

  // Prevent Cursor agent from tampering with git hooks and CI workflows
  engine.registerRule(createGitCIProtectionRule({ blockAll: true }));

  // Prevent Cursor agent from reading system keys (.ssh, /etc/shadow)
  engine.registerRule(createSensitiveDirectoryBlockerRule());

  // Redact customer payment details if accidentally pasted into editor
  engine.registerRule(createCreditCardScrubberRule());

  return engine;
}

/**
 * 2. Evaluates an action requested by Cursor AI Agent Mode before execution.
 */
export async function evaluateCursorAction(
  engine: SentinelEngine,
  req: CursorToolExecutionRequest
): Promise<CursorGuardResponse> {
  const ctx: ToolCallContext = {
    id: `cursor_${Date.now()}`,
    toolName: req.tool,
    params: {
      command: req.command,
      filePath: req.filePath,
      path: req.filePath,
      content: req.content,
      url: req.url,
    },
    timestamp: Date.now(),
  };

  const res = await engine.evaluate(ctx);

  if (!res.allowed || res.verdict === Verdict.BLOCK) {
    return {
      allow: false,
      verdict: Verdict.BLOCK,
      warningOrError: `[AgentSentinel Cursor Shield] Blocked: ${res.violations[0]?.reason}`,
    };
  }

  if (res.verdict === Verdict.CONFIRM) {
    return {
      allow: false,
      verdict: Verdict.CONFIRM,
      warningOrError: `[AgentSentinel Cursor Shield] Requires User Confirmation: ${res.violations[0]?.reason}`,
    };
  }

  return {
    allow: true,
    verdict: Verdict.ALLOW,
    sanitizedPayload: res.sanitizedParams || ctx.params,
  };
}

// Standalone execution demo
if (process.argv[1]?.endsWith('cursor_ai_guard.ts') && !process.env.VITEST) {
  const engine = createCursorAiSentinel(process.cwd());

  console.log('--- 🛡️ AgentSentinel Cursor AI Shield Active ---');

  // Case 1: Normal safe file edit inside workspace
  evaluateCursorAction(engine, {
    tool: 'cursor_file_edit',
    filePath: 'src/components/Button.tsx',
    content: 'export const Button = () => <button>Click me</button>;',
  }).then((r) => console.log('\n[Case 1] Safe Edit Allowed:', r));

  // Case 2: Attempting to modify .git/hooks/pre-commit
  evaluateCursorAction(engine, {
    tool: 'cursor_file_edit',
    filePath: '.git/hooks/pre-commit',
    content: '#!/bin/sh\nexit 0',
  }).then((r) => console.log('\n[Case 2] Git Hook Tamper Blocked:', r));
}
