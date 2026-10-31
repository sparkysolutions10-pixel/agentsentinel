#!/usr/bin/env node
/**
 * AgentSentinel CLI Entrypoint.
 */

import { runCli } from './runner.js';

export * from './types.js';
export * from './parser.js';
export * from './runner.js';
export * from './init.js';

// Auto-execute if invoked as a CLI executable directly, not when imported or tested
const scriptPath = (process.argv[1] || '').replace(/\\/g, '/');
const isCliExecution = Boolean(
  scriptPath &&
  (scriptPath.endsWith('cli/index.js') ||
   scriptPath.endsWith('bin/agentsentinel') ||
   scriptPath.endsWith('bin/agentsentinel.js') ||
   scriptPath.includes('agentsentinel')) &&
  !process.env.VITEST &&
  process.env.NODE_ENV !== 'test'
);

if (isCliExecution) {
  runCli(process.argv.slice(2))
    .then((exitCode) => {
      process.exit(exitCode);
    })
    .catch((err) => {
      console.error(`[AgentSentinel CLI Fatal Error]`, err);
      process.exit(1);
    });
}
