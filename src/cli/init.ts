import * as fs from 'fs';
import * as path from 'path';
import { CliOptions, CLI_EXIT_CODES } from './types.js';
import { validatePolicyConfig } from '../policy.js';

export type PolicyPreset = 'enterprise' | 'developer' | 'minimal';

export interface InitResult {
  success: boolean;
  filePath: string;
  preset: PolicyPreset;
  message: string;
}

export const PRESET_CONFIGS: Record<PolicyPreset, object> = {
  enterprise: {
    version: '1.0',
    name: 'Enterprise Zero-Trust Autonomous Agent Policy',
    description: 'Strict security posture blocking destructive file system writes, SQL drops, credential leaks, and SSRF.',
    rules: [
      {
        id: 'ent-block-destructive-shell',
        name: 'Block Destructive Commands',
        category: 'shell',
        priority: 1000,
        enabled: true,
        match: {
          tools: ['bash_exec', 'shell', 'exec_command', 'run_terminal'],
          patterns: ['*rm *-rf*/*', '*mkfs*', '*dd *of=/dev/*'],
        },
        action: {
          verdict: 'BLOCK',
          severity: 'critical',
          reason: 'Destructive operating system modifications are strictly prohibited by enterprise policy.',
        },
      },
      {
        id: 'ent-block-sql-table-drops',
        name: 'Block Destructive DDL Queries',
        category: 'sql',
        priority: 950,
        enabled: true,
        match: {
          tools: ['query_database', 'sql_exec', 'run_sql'],
          patterns: ['*DROP TABLE*', '*DROP DATABASE*', '*TRUNCATE*'],
        },
        action: {
          verdict: 'BLOCK',
          severity: 'critical',
          reason: 'Destructive schema modifications must be executed via reviewed migration pipelines.',
        },
      },
      {
        id: 'ent-block-cloud-metadata-ssrf',
        name: 'Block Cloud Metadata SSRF',
        category: 'network',
        priority: 900,
        enabled: true,
        match: {
          tools: ['http_request', 'fetch_url', 'curl'],
          patterns: ['*169.254.169.254*', '*metadata.google.internal*'],
        },
        action: {
          verdict: 'BLOCK',
          severity: 'critical',
          reason: 'Access to cloud instance metadata services is forbidden.',
        },
      },
      {
        id: 'ent-redact-sensitive-tokens',
        name: 'Redact High-Entropy Secret Tokens',
        category: 'secrets',
        priority: 850,
        enabled: true,
        match: {
          tools: ['*'],
          patterns: ['*AKIA[0-9A-Z]{16}*', '*ghp_[a-zA-Z0-9]{36}*'],
        },
        action: {
          verdict: 'REDACT',
          severity: 'high',
          reason: 'Sensitive cloud or git credentials masked before tool dispatch.',
        },
      },
    ],
  },

  developer: {
    version: '1.0',
    name: 'Developer Local Sandbox Policy',
    description: 'Permissive development profile providing warnings and confirmations for risky operations.',
    rules: [
      {
        id: 'dev-warn-dangerous-commands',
        name: 'Confirm System Changes in Dev',
        category: 'shell',
        priority: 800,
        enabled: true,
        match: {
          tools: ['bash_exec', 'shell'],
          patterns: ['*rm -rf*'],
        },
        action: {
          verdict: 'CONFIRM',
          severity: 'medium',
          reason: 'Requires interactive developer approval before recursive deletion.',
        },
      },
      {
        id: 'dev-redact-api-keys',
        name: 'Redact Development Secrets',
        category: 'secrets',
        priority: 800,
        enabled: true,
        match: {
          tools: ['*'],
          patterns: ['*sk-[a-zA-Z0-9]{32,}*'],
        },
        action: {
          verdict: 'REDACT',
          severity: 'medium',
          reason: 'Masked API secret keys in development logs.',
        },
      },
    ],
  },

  minimal: {
    version: '1.0',
    name: 'Minimal AgentSentinel Starter Policy',
    description: 'Baseline configuration template for custom policy development.',
    rules: [
      {
        id: 'starter-block-example',
        name: 'Example Starter Rule',
        category: 'custom',
        priority: 500,
        enabled: true,
        match: {
          tools: ['example_tool'],
          patterns: ['*forbidden_parameter*'],
        },
        action: {
          verdict: 'BLOCK',
          severity: 'low',
          reason: 'Example security policy constraint.',
        },
      },
    ],
  },
};

/**
 * Scaffolds an agentsentinel.policy.json configuration file.
 */
export function scaffoldPolicy(
  targetPathOrDir: string,
  preset: PolicyPreset = 'enterprise',
  force: boolean = false
): InitResult {
  let targetFile: string;

  if (fs.existsSync(targetPathOrDir) && fs.statSync(targetPathOrDir).isDirectory()) {
    targetFile = path.join(targetPathOrDir, 'agentsentinel.policy.json');
  } else if (targetPathOrDir.endsWith('.json')) {
    targetFile = targetPathOrDir;
  } else {
    targetFile = path.join(targetPathOrDir, 'agentsentinel.policy.json');
  }

  if (fs.existsSync(targetFile) && !force) {
    return {
      success: false,
      filePath: targetFile,
      preset,
      message: `Configuration file already exists at "${targetFile}". Use --force to overwrite.`,
    };
  }

  const configObj = PRESET_CONFIGS[preset] || PRESET_CONFIGS.enterprise;

  // Validate to ensure template adheres to declarative policy specification
  validatePolicyConfig(configObj);

  const formattedJson = JSON.stringify(configObj, null, 2);
  const dir = path.dirname(targetFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(targetFile, formattedJson + '\n', 'utf8');

  return {
    success: true,
    filePath: targetFile,
    preset,
    message: `Successfully created AgentSentinel policy configuration (${preset} preset) at "${targetFile}".`,
  };
}

/**
 * Handles the CLI init command.
 */
export function handleInitCommand(
  options: CliOptions & { preset?: PolicyPreset; force?: boolean },
  out: (msg: string) => void = console.log,
  err: (msg: string) => void = console.error
): number {
  const target = options.file || process.cwd();
  const preset = (options as any).preset || 'enterprise';
  const force = Boolean((options as any).force);

  const result = scaffoldPolicy(target, preset, force);

  if (!result.success) {
    err(`[AgentSentinel] Error: ${result.message}`);
    return CLI_EXIT_CODES.INVALID_ARGS;
  }

  out(`[AgentSentinel] ${result.message}`);
  return CLI_EXIT_CODES.SUCCESS;
}
