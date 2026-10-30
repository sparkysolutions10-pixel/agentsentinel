import { RuleViolation, Verdict } from '../types.js';

export interface CliOptions {
  command?: 'audit' | 'audit-log' | 'check' | 'eval' | 'init' | 'version' | 'help';
  file?: string;
  policyFile?: string;
  format?: 'text' | 'json';
  strict?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
  toolName?: string;
  paramsJson?: string;
  targetString?: string;
  preset?: 'enterprise' | 'developer' | 'minimal';
  force?: boolean;
}

export interface CliAuditReport {
  target: string;
  clean: boolean;
  verdict: Verdict;
  violations: RuleViolation[];
  latencyMs: number;
  summary: string;
}

export const CLI_EXIT_CODES = {
  SUCCESS: 0,
  VIOLATION_BLOCKED: 1,
  FILE_NOT_FOUND: 2,
  INVALID_ARGS: 3,
  PARSE_ERROR: 4,
} as const;
