/**
 * AgentSentinel Default Security Engine Provider for MCP
 *
 * Instantiates and preconfigures SentinelEngine with the full 51+ invariant suite
 * covering Shell AST, SQL AST, Filesystem Jail, and Secret/PII Scrubbing.
 *
 * @license MIT
 * @author Sparky Solutions (Mukesh Biswas)
 */

import { SentinelEngine } from '../index.js';
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

export function createDefaultMcpEngine(): SentinelEngine {
  const engine = new SentinelEngine();

  const rules = [
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

  for (const rule of rules) {
    engine.registry.register(rule);
  }

  return engine;
}
