/**
 * High-performance Bash / POSIX Shell Command Tokenizer and Pipeline AST Parser.
 * Accurately extracts executables, flags, chained pipelines (|, &&, ||), and nested subshells ($(..), `..`).
 */

export type ShellChainingOperator = '|' | '||' | '&&' | ';' | '&';

export interface ShellStage {
  raw: string;
  executable: string;
  args: string[];
  flags: string[];
  operator?: ShellChainingOperator;
  subshells: string[];
  envVars: Record<string, string>;
  redirects: string[];
}

export interface ParsedShellPipeline {
  raw: string;
  stages: ShellStage[];
  allExecutables: string[];
  allSubshells: string[];
  hasChainedOperators: boolean;
}

/**
 * Splits a raw shell string into atomic shell tokens, respecting quotes, escapes, and substitutions.
 */
export function tokenizeShellString(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escaped = false;
  let inParenSubshell = 0; // $(...) depth
  let inBacktick = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const next = input[i + 1];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\' && !inSingleQuote) {
      escaped = true;
      current += char;
      continue;
    }

    // Single quotes preserve literal text
    if (char === "'" && !inDoubleQuote && inParenSubshell === 0 && !inBacktick) {
      inSingleQuote = !inSingleQuote;
      current += char;
      continue;
    }

    // Double quotes
    if (char === '"' && !inSingleQuote && inParenSubshell === 0 && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
      current += char;
      continue;
    }

    // Subshell $()
    if (char === '$' && next === '(' && !inSingleQuote) {
      inParenSubshell++;
      current += '$(';
      i++;
      continue;
    }
    if (char === ')' && inParenSubshell > 0 && !inSingleQuote) {
      inParenSubshell--;
      current += ')';
      continue;
    }

    // Backticks
    if (char === '`' && !inSingleQuote) {
      inBacktick = !inBacktick;
      current += char;
      continue;
    }

    // When outside quotes and subshells, check operators and whitespace
    if (!inSingleQuote && !inDoubleQuote && inParenSubshell === 0 && !inBacktick) {
      // Check multi-char chaining operators: &&, ||
      if ((char === '&' && next === '&') || (char === '|' && next === '|')) {
        if (current.trim()) tokens.push(current.trim());
        tokens.push(char + next);
        current = '';
        i++;
        continue;
      }

      // Check single-char chaining operators: |, ;, & (if not part of redirect like 2>&1)
      if (char === '|' || char === ';') {
        if (current.trim()) tokens.push(current.trim());
        tokens.push(char);
        current = '';
        continue;
      }

      if (char === '&' && next !== '>' && input[i - 1] !== '>') {
        if (current.trim()) tokens.push(current.trim());
        tokens.push(char);
        current = '';
        continue;
      }

      // Whitespace delimiter
      if (/\s/.test(char)) {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
        continue;
      }
    }

    current += char;
  }

  if (current.trim()) {
    tokens.push(current.trim());
  }

  return tokens;
}

/**
 * Extracts subshell commands enclosed in $(...) or `...`.
 */
export function extractSubshellCommands(input: string): string[] {
  const subshells: string[] = [];

  // Match $(...) with nested parenthesis handling
  let idx = 0;
  while ((idx = input.indexOf('$(', idx)) !== -1) {
    let depth = 1;
    let endIdx = idx + 2;
    while (endIdx < input.length && depth > 0) {
      if (input[endIdx] === '(') depth++;
      else if (input[endIdx] === ')') depth--;
      endIdx++;
    }
    if (depth === 0) {
      const subCmd = input.substring(idx + 2, endIdx - 1).trim();
      if (subCmd) subshells.push(subCmd);
      idx = endIdx;
    } else {
      break;
    }
  }

  // Match backticks `...`
  const backtickRegex = /`([^`]+)`/g;
  let match;
  while ((match = backtickRegex.exec(input)) !== null) {
    const subCmd = match[1].trim();
    if (subCmd && !subshells.includes(subCmd)) {
      subshells.push(subCmd);
    }
  }

  return subshells;
}

const COMMAND_WRAPPERS = new Set(['xargs', 'sudo', 'nohup', 'exec', 'time', 'env', 'doas']);

/**
 * Parses a complete shell command line into structured stages, operators, executables, and subshells.
 */
export function parseShellCommand(commandString: string): ParsedShellPipeline {
  const raw = commandString.trim();
  if (!raw) {
    return {
      raw: '',
      stages: [],
      allExecutables: [],
      allSubshells: [],
      hasChainedOperators: false,
    };
  }

  const rawTokens = tokenizeShellString(raw);
  const stages: ShellStage[] = [];
  const allExecutables: Set<string> = new Set();
  const allSubshells: Set<string> = new Set();

  let currentTokens: string[] = [];

  const flushStage = (op?: ShellChainingOperator) => {
    if (currentTokens.length === 0) return;

    const envVars: Record<string, string> = {};
    const redirects: string[] = [];
    let tokenIdx = 0;

    // Extract leading environment variables (e.g. VAR=val cmd)
    while (tokenIdx < currentTokens.length && /^[a-zA-Z_][a-zA-Z0-9_]*=/.test(currentTokens[tokenIdx])) {
      const eqIdx = currentTokens[tokenIdx].indexOf('=');
      const k = currentTokens[tokenIdx].slice(0, eqIdx);
      const v = currentTokens[tokenIdx].slice(eqIdx + 1);
      envVars[k] = v;
      tokenIdx++;
    }

    const commandTokens: string[] = [];
    for (let i = tokenIdx; i < currentTokens.length; i++) {
      const t = currentTokens[i];
      // Detect redirections (> /dev/null, 2>&1, >> out, < in)
      if (/^[0-9]*>>?$/.test(t) || t === '<' || t === '2>&1' || t === '&>' || t.startsWith('>')) {
        redirects.push(t);
        // If next token is file target (e.g. /dev/null), capture it as redirect target
        if (i + 1 < currentTokens.length && !currentTokens[i + 1].startsWith('-')) {
          redirects.push(currentTokens[i + 1]);
          i++;
        }
      } else {
        commandTokens.push(t);
      }
    }

    if (commandTokens.length === 0) {
      currentTokens = [];
      return;
    }

    // Strip outer quotes from executable if present
    const rawExec = commandTokens[0];
    const executable = rawExec.replace(/^["']|["']$/g, '');
    const args: string[] = [];
    const flags: string[] = [];
    const subshells: string[] = [];

    // Extract subshells from the stage's raw string
    const stageRaw = currentTokens.join(' ');
    const stageSubshells = extractSubshellCommands(stageRaw);
    for (const sub of stageSubshells) {
      subshells.push(sub);
      allSubshells.add(sub);
      // Recursively parse subshell to find its executables
      const parsedSub = parseShellCommand(sub);
      for (const subExec of parsedSub.allExecutables) {
        allExecutables.add(subExec);
      }
    }

    for (let i = 1; i < commandTokens.length; i++) {
      const token = commandTokens[i];
      const stripped = token.replace(/^["']|["']$/g, '');
      args.push(stripped);

      if (token.startsWith('-')) {
        flags.push(stripped);
      }
    }

    if (executable) {
      allExecutables.add(executable);
    }

    // Check wrapper commands (sudo, xargs, etc.) to unwrap forwarded executables
    if (COMMAND_WRAPPERS.has(executable)) {
      // Find the first non-flag argument
      for (const arg of args) {
        if (!arg.startsWith('-') && !arg.includes('=')) {
          allExecutables.add(arg);
          break;
        }
      }
    }

    // Check for inline script execution like bash -c "..." or sh -c "..."
    if (['bash', 'sh', 'zsh', 'ksh'].includes(executable)) {
      const cIndex = args.indexOf('-c');
      if (cIndex !== -1 && cIndex + 1 < args.length) {
        const inlineScript = args[cIndex + 1];
        const nestedPipeline = parseShellCommand(inlineScript);
        for (const sub of nestedPipeline.allSubshells) {
          allSubshells.add(sub);
        }
        for (const nExec of nestedPipeline.allExecutables) {
          allExecutables.add(nExec);
        }
      }
    }

    stages.push({
      raw: stageRaw,
      executable,
      args,
      flags,
      operator: op,
      subshells,
      envVars,
      redirects,
    });

    currentTokens = [];
  };

  const isChainingOp = (token: string): token is ShellChainingOperator => {
    return ['|', '||', '&&', ';', '&'].includes(token);
  };

  let hasChained = false;

  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];
    if (isChainingOp(token)) {
      hasChained = true;
      flushStage(token);
    } else {
      currentTokens.push(token);
    }
  }

  flushStage(undefined);

  return {
    raw,
    stages,
    allExecutables: Array.from(allExecutables),
    allSubshells: Array.from(allSubshells),
    hasChainedOperators: hasChained,
  };
}
