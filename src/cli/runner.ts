import * as fs from 'fs';
import * as path from 'path';
import { CliOptions, CliAuditReport, CLI_EXIT_CODES } from './types.js';
import { handleInitCommand } from './init.js';
import { parseCliArgs } from './parser.js';
import { SentinelEngine } from '../index.js';
import { ToolCallContext, Verdict, RuleViolation } from '../types.js';
import { validatePolicyConfig, compileDeclarativeRule } from '../policy.js';
import {
  createDestructiveDeletionRule,
  createDiskWipeRule,
  forkBombBlockerRule,
  reverseShellBlockerRule,
  curlPipeBlockerRule,
  powerShellBypassBlockerRule,
  privilegeEscalationBlockerRule,
  shutdownBlockerRule,
  envLeakBlockerRule,
  firewallDisablementBlockerRule,
  base64ExecBlockerRule,
  cronPersistenceBlockerRule,
  cwdConfinementRule,
} from '../shell/index.js';
import {
  destructiveDdlRule,
  truncateBlockerRule,
  unconstrainedDeleteRule,
  unconstrainedUpdateRule,
  stackedQueryGuardRule,
  systemCatalogGuardRule,
} from '../sql/index.js';
import {
  pathTraversalGuardRule,
  sensitiveDirectoryBlockerRule,
  gitCIProtectionRule,
  writeSizeLimiterRule,
  defaultWorkspaceJailGuardRule,
  batchDeleteLimiterRule,
} from '../fs/index.js';
import {
  llmKeyScrubberRule,
  awsKeyDetectorRule,
  githubTokenScrubberRule,
  pemKeyDetectorRule,
  web3KeyScrubberRule,
  creditCardScrubberRule,
  piiScrubberRule,
  emailPhoneMaskRule,
  shannonEntropyRule,
} from '../secrets/index.js';

export const VERSION = '0.1.0';

/**
 * Creates and initializes a SentinelEngine with comprehensive default security rulesets.
 */
export function createDefaultCliEngine(policyFile?: string): SentinelEngine {
  const engine = new SentinelEngine();

  // Register Built-in Default Rulesets
  const defaultRules = [
    // Shell guards
    createDestructiveDeletionRule(),
    createDiskWipeRule(),
    forkBombBlockerRule,
    reverseShellBlockerRule,
    curlPipeBlockerRule,
    powerShellBypassBlockerRule,
    privilegeEscalationBlockerRule,
    shutdownBlockerRule,
    envLeakBlockerRule,
    firewallDisablementBlockerRule,
    base64ExecBlockerRule,
    cronPersistenceBlockerRule,
    cwdConfinementRule,

    // SQL guards
    destructiveDdlRule,
    truncateBlockerRule,
    unconstrainedDeleteRule,
    unconstrainedUpdateRule,
    stackedQueryGuardRule,
    systemCatalogGuardRule,

    // Filesystem guards
    pathTraversalGuardRule,
    sensitiveDirectoryBlockerRule,
    gitCIProtectionRule,
    writeSizeLimiterRule,
    defaultWorkspaceJailGuardRule,
    batchDeleteLimiterRule,

    // Secret & PII guards
    llmKeyScrubberRule,
    awsKeyDetectorRule,
    githubTokenScrubberRule,
    pemKeyDetectorRule,
    web3KeyScrubberRule,
    creditCardScrubberRule,
    piiScrubberRule,
    emailPhoneMaskRule,
    shannonEntropyRule,
  ];

  for (const rule of defaultRules) {
    engine.registry.register(rule);
  }

  // Load custom policy config if supplied
  if (policyFile) {
    if (fs.existsSync(policyFile)) {
      const raw = fs.readFileSync(policyFile, 'utf8');
      const parsedConfig = validatePolicyConfig(JSON.parse(raw));
      for (const rule of parsedConfig.rules) {
        engine.registry.register(compileDeclarativeRule(rule));
      }
    }
  }

  return engine;
}

/**
 * Core CLI execution router.
 */
export async function runCli(
  argv: string[],
  out: (msg: string) => void = console.log,
  err: (msg: string) => void = console.error
): Promise<number> {
  const options = parseCliArgs(argv);

  switch (options.command) {
    case 'version':
      out(`agentsentinel v${VERSION}`);
      return CLI_EXIT_CODES.SUCCESS;

    case 'help':
      out(getHelpManual());
      return CLI_EXIT_CODES.SUCCESS;

    case 'init':
      return handleInitCommand(options, out, err);

    case 'check':
      return handleCheckCommand(options, out, err);

    case 'eval':
      return handleEvalCommand(options, out, err);

    case 'audit-log':
      return handleAuditLogCommand(options, out, err);

    case 'audit':
    default:
      return handleAuditFileCommand(options, out, err);
  }
}

function getHelpManual(): string {
  return `AgentSentinel CLI v${VERSION}
Zero-Trust Security Firewall & Policy Guard for AI Agents & Autonomous Tools

Usage:
  agentsentinel audit <file> [options]         Audit a script, SQL query, or payload file
  agentsentinel check --cmd "<command>"        Audit an inline command or query
  agentsentinel eval --tool <name> --params    Audit a structured tool call JSON
  agentsentinel audit-log <log.jsonl>          Audit and verify an AgentSentinel audit log
  agentsentinel init [path]                    Scaffold a new agentsentinel.policy.json
  agentsentinel --help | -h                    Show this help manual
  agentsentinel --version | -v                 Show version information

Options:
  --policy, -p <file>     Custom declarative policy JSON configuration
  --format, -f <text|json> Output report formatting (default: text)
  --strict / --no-strict  Exit code 1 on violations (default: strict)
  --dry-run               Simulate evaluation without blocking
  --verbose               Show rule priority and latency metrics
`;
}


async function handleCheckCommand(options: CliOptions, out: (msg: string) => void, err: (msg: string) => void): Promise<number> {
  const target = options.targetString || options.file;
  if (!target) {
    err('[AgentSentinel] Error: No command specified. Use --cmd "<command>"');
    return CLI_EXIT_CODES.INVALID_ARGS;
  }

  const engine = createDefaultCliEngine(options.policyFile);
  const context: ToolCallContext = {
    id: `cli-check-${Date.now()}`,
    toolName: 'bash_exec',
    category: 'shell',
    params: { command: target },
    timestamp: Date.now(),
  };

  const evalResult = await engine.evaluate(context, { dryRun: options.dryRun });
  const report: CliAuditReport = {
    target,
    clean: evalResult.allowed,
    verdict: evalResult.verdict,
    violations: evalResult.violations,
    latencyMs: evalResult.latencyMs,
    summary: evalResult.allowed ? 'PASSED: No security violations detected.' : `BLOCKED: ${evalResult.violations.map((v) => v.reason).join(' | ')}`,
  };

  outputReport(report, options, out);
  return evalResult.allowed || !options.strict ? CLI_EXIT_CODES.SUCCESS : CLI_EXIT_CODES.VIOLATION_BLOCKED;
}

async function handleEvalCommand(options: CliOptions, out: (msg: string) => void, err: (msg: string) => void): Promise<number> {
  if (!options.toolName) {
    err('[AgentSentinel] Error: --tool <name> is required for eval command.');
    return CLI_EXIT_CODES.INVALID_ARGS;
  }

  let params: Record<string, any> = {};
  if (options.paramsJson) {
    try {
      params = JSON.parse(options.paramsJson);
    } catch (e: any) {
      err(`[AgentSentinel] Error parsing JSON params: ${e.message}`);
      return CLI_EXIT_CODES.PARSE_ERROR;
    }
  }

  const engine = createDefaultCliEngine(options.policyFile);
  const context: ToolCallContext = {
    id: `cli-eval-${Date.now()}`,
    toolName: options.toolName,
    params,
    timestamp: Date.now(),
  };

  const evalResult = await engine.evaluate(context, { dryRun: options.dryRun });
  const report: CliAuditReport = {
    target: options.toolName,
    clean: evalResult.allowed,
    verdict: evalResult.verdict,
    violations: evalResult.violations,
    latencyMs: evalResult.latencyMs,
    summary: evalResult.allowed ? 'PASSED: Tool call cleared by security policy.' : `BLOCKED: ${evalResult.violations.map((v) => v.reason).join(' | ')}`,
  };

  outputReport(report, options, out);
  return evalResult.allowed || !options.strict ? CLI_EXIT_CODES.SUCCESS : CLI_EXIT_CODES.VIOLATION_BLOCKED;
}

async function handleAuditFileCommand(options: CliOptions, out: (msg: string) => void, err: (msg: string) => void): Promise<number> {
  const filePath = options.file;
  if (!filePath) {
    err('[AgentSentinel] Error: No file specified for audit.');
    return CLI_EXIT_CODES.INVALID_ARGS;
  }

  if (!fs.existsSync(filePath)) {
    err(`[AgentSentinel] File not found: ${filePath}`);
    return CLI_EXIT_CODES.FILE_NOT_FOUND;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath).toLowerCase();

  const engine = createDefaultCliEngine(options.policyFile);
  let context: ToolCallContext;

  if (ext === '.sql') {
    context = {
      id: `cli-audit-sql-${Date.now()}`,
      toolName: 'execute_sql',
      category: 'sql',
      params: { query: content },
      timestamp: Date.now(),
    };
  } else if (ext === '.json') {
    try {
      const parsed = JSON.parse(content);
      context = {
        id: `cli-audit-json-${Date.now()}`,
        toolName: parsed.toolName || 'tool_call',
        category: parsed.category,
        params: parsed.params || parsed,
        timestamp: Date.now(),
      };
    } catch {
      context = {
        id: `cli-audit-raw-${Date.now()}`,
        toolName: 'inspect_content',
        params: { content },
        timestamp: Date.now(),
      };
    }
  } else {
    // Shell or generic script
    context = {
      id: `cli-audit-sh-${Date.now()}`,
      toolName: 'bash_exec',
      category: 'shell',
      params: { command: content.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('#')).join(' ; ') || content },
      timestamp: Date.now(),
    };
  }

  const evalResult = await engine.evaluate(context, { dryRun: options.dryRun });
  const report: CliAuditReport = {
    target: filePath,
    clean: evalResult.allowed,
    verdict: evalResult.verdict,
    violations: evalResult.violations,
    latencyMs: evalResult.latencyMs,
    summary: evalResult.allowed
      ? `PASSED: File "${filePath}" passed zero-trust security audit.`
      : `BLOCKED: File "${filePath}" triggered ${evalResult.violations.length} policy violation(s).`,
  };

  outputReport(report, options, out);
  return evalResult.allowed || !options.strict ? CLI_EXIT_CODES.SUCCESS : CLI_EXIT_CODES.VIOLATION_BLOCKED;
}

async function handleAuditLogCommand(options: CliOptions, out: (msg: string) => void, err: (msg: string) => void): Promise<number> {
  const filePath = options.file;
  if (!filePath || !fs.existsSync(filePath)) {
    err(`[AgentSentinel] Error: Audit log file not found: ${filePath}`);
    return CLI_EXIT_CODES.FILE_NOT_FOUND;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter((l) => l.trim().length > 0);

  let totalEvents = 0;
  let blockedCount = 0;
  const violationsFound: RuleViolation[] = [];

  for (const line of lines) {
    try {
      const event = JSON.parse(line);
      totalEvents++;
      if (event.verdict === Verdict.BLOCK || event.verdict === 'BLOCK') {
        blockedCount++;
        if (event.violations) {
          violationsFound.push(...event.violations);
        }
      }
    } catch {
      // ignore non-json line
    }
  }

  const summary = `Audit log "${filePath}": Scanned ${totalEvents} event(s), found ${blockedCount} blocked violation(s).`;
  if (options.format === 'json') {
    out(JSON.stringify({ filePath, totalEvents, blockedCount, violationsFound, summary }, null, 2));
  } else {
    out(`[AgentSentinel Log Audit] ${summary}`);
  }

  return blockedCount > 0 && options.strict ? CLI_EXIT_CODES.VIOLATION_BLOCKED : CLI_EXIT_CODES.SUCCESS;
}

function outputReport(report: CliAuditReport, options: CliOptions, out: (msg: string) => void): void {
  if (options.format === 'json') {
    out(JSON.stringify(report, null, 2));
    return;
  }

  const badge = report.clean ? '✅ ALLOW' : '🚫 BLOCK';
  out(`------------------------------------------------------------`);
  out(`AgentSentinel Security Audit Report`);
  out(`Target : ${report.target}`);
  out(`Verdict: ${badge} (${report.verdict})`);
  out(`Latency: ${report.latencyMs.toFixed(2)}ms`);
  out(`Summary: ${report.summary}`);

  if (report.violations.length > 0) {
    out(`\nViolations Details:`);
    report.violations.forEach((v, idx) => {
      out(`  ${idx + 1}. [${v.severity.toUpperCase()}] ${v.ruleName} (${v.ruleId})`);
      out(`     Reason: ${v.reason}`);
    });
  }
  out(`------------------------------------------------------------`);
}
