import { CliOptions } from './types.js';

export function parseCliArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    format: 'text',
    strict: true,
  };

  const args = [...argv];
  if (args.length === 0) {
    options.command = 'help';
    return options;
  }

  const firstArg = args[0];
  if (firstArg === '--help' || firstArg === '-h' || firstArg === 'help') {
    options.command = 'help';
    return options;
  }
  if (firstArg === '--version' || firstArg === '-v' || firstArg === 'version') {
    options.command = 'version';
    return options;
  }

  if (['audit', 'audit-log', 'check', 'eval', 'init'].includes(firstArg)) {
    options.command = firstArg as any;
    args.shift();
  } else if (!firstArg.startsWith('-')) {
    options.command = 'audit';
    options.file = firstArg;
    args.shift();
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--policy' || arg === '-p') {
      options.policyFile = args[++i];
    } else if (arg === '--format' || arg === '-f') {
      const fmt = args[++i]?.toLowerCase();
      options.format = fmt === 'json' ? 'json' : 'text';
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--no-strict') {
      options.strict = false;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--tool' || arg === '-t') {
      options.toolName = args[++i];
    } else if (arg === '--params') {
      options.paramsJson = args[++i];
    } else if (arg === '--cmd' || arg === '-c') {
      options.targetString = args[++i];
    } else if (arg === '--preset') {
      const p = args[++i]?.toLowerCase();
      if (p === 'developer' || p === 'minimal' || p === 'enterprise') {
        options.preset = p;
      }
    } else if (arg === '--force') {
      options.force = true;
    } else if (!arg.startsWith('-') && !options.file) {
      options.file = arg;
    }
  }

  return options;
}
