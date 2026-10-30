/**
 * Curl/Wget Remote Code Execution Shell Pipe Detector.
 * Identifies and intercepts dangerous patterns where remote web payloads
 * are fetched via curl, wget, fetch, or PowerShell and immediately piped
 * or evaluated in an execution shell (curl ... | bash, wget ... | sh, eval $(curl ...)).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface CurlPipeDetectionResult {
  isCurlPipe: boolean;
  downloader?: 'curl' | 'wget' | 'fetch' | 'httpie' | 'powershell';
  targetShell?: string;
  url?: string;
  reason?: string;
  detectedPattern?: string;
}

// 1. Classic pipeline: [ENV=val ...] curl/wget/fetch/http [args] | [sudo] (bash|sh|zsh|dash|ksh|python|perl|ruby|node)
const CURL_WGET_PIPE_REGEX = /(?:^|[;&|]\s*)(?:[A-Za-z_][A-Za-z0-9_]*=[^\s]+\s+)*(curl|wget|fetch|http)\s+([^|;&]+?)\s*\|\s*(?:sudo\s+)?(?:\/usr(?:\/local)?\/bin\/|\/bin\/)?(bash|sh|zsh|dash|ksh|python[23]?|perl|ruby|node)(?:\s+-[a-zA-Z0-9]+|\s+--[a-zA-Z0-9-]+|\s+-)?(?:\s|$)/i;

// 2. Process substitution: (bash|sh|zsh) <((curl|wget|fetch) ...)
const PROC_SUBSTITUTION_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?(?:\/usr(?:\/local)?\/bin\/|\/bin\/)?(bash|sh|zsh|dash|ksh)\s+<\(\s*(curl|wget|fetch)\s+([^)]+)\)/i;

// 3. Eval / subshell execution: eval "$(curl ...)" or eval `wget ...`
const EVAL_SUBEXEC_REGEX = /(?:^|[;&|]\s*)eval\s+["']?(?:\$\(\s*(curl|wget|fetch)\s+([^)]+)\)|`\s*(curl|wget|fetch)\s+([^`]+)`)/i;

// 4. PowerShell web request piped to Invoke-Expression (iex / Invoke-Expression)
const POWERSHELL_IEX_PIPE_REGEX = /(?:^|[;&|]\s*)(?:Invoke-RestMethod|irm|Invoke-WebRequest|iwr)\s+([^|;&]+?)\s*\|\s*(?:iex|Invoke-Expression)(?:\s|$)/i;

// 5. PowerShell iex / Invoke-Expression with nested call: iex (iwr ...) or iex (irm ...)
const POWERSHELL_IEX_PAREN_REGEX = /(?:^|[;&|]\s*)(?:iex|Invoke-Expression)\s*\(\s*(?:iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\s+([^)]+)\)/i;

// 6. PowerShell WebClient DownloadString evaluated: iex ((New-Object Net.WebClient).DownloadString(...))
const POWERSHELL_WEBCLIENT_REGEX = /(?:^|[;&|]\s*)(?:iex|Invoke-Expression)\s*\(\s*(?:\(?New-Object\s+Net\.WebClient\)?)\.DownloadString\s*\(\s*["']([^"']+)["']\s*\)/i;

// URL extractor helper (supports http, https, ftp, ftps)
const URL_REGEX = /((?:https?|ftp|ftps):\/\/[^\s"'<>|)]+)/i;

/**
 * Analyzes command line strings for dangerous remote script execution patterns.
 */
export function detectCurlPipe(rawCommand: string): CurlPipeDetectionResult {
  if (!rawCommand || typeof rawCommand !== 'string') {
    return { isCurlPipe: false };
  }

  // 1. curl/wget piped directly to shell/interpreter
  const pipeMatch = rawCommand.match(CURL_WGET_PIPE_REGEX);
  if (pipeMatch) {
    const rawDownloader = pipeMatch[1].toLowerCase();
    const downloader: 'curl' | 'wget' | 'fetch' | 'httpie' =
      rawDownloader === 'http' ? 'httpie' : (rawDownloader as 'curl' | 'wget' | 'fetch');
    const rawArgs = pipeMatch[2];
    const targetShell = pipeMatch[3].toLowerCase();
    const urlMatch = rawArgs.match(URL_REGEX);
    const url = urlMatch ? urlMatch[1] : undefined;

    return {
      isCurlPipe: true,
      downloader,
      targetShell,
      url,
      reason: `Remote payload downloaded via ${downloader}${url ? ` (${url})` : ''} and piped directly into execution shell [${targetShell}]`,
      detectedPattern: pipeMatch[0].trim(),
    };
  }

  // 2. Process substitution: bash <(curl ...)
  const subMatch = rawCommand.match(PROC_SUBSTITUTION_REGEX);
  if (subMatch) {
    const targetShell = subMatch[1].toLowerCase();
    const downloader = subMatch[2].toLowerCase() as 'curl' | 'wget' | 'fetch';
    const rawArgs = subMatch[3];
    const urlMatch = rawArgs.match(URL_REGEX);
    const url = urlMatch ? urlMatch[1] : undefined;

    return {
      isCurlPipe: true,
      downloader,
      targetShell,
      url,
      reason: `Remote payload downloaded via ${downloader}${url ? ` (${url})` : ''} and executed via process substitution <(...) in [${targetShell}]`,
      detectedPattern: subMatch[0].trim(),
    };
  }

  // 3. Eval subshell: eval "$(curl ...)"
  const evalMatch = rawCommand.match(EVAL_SUBEXEC_REGEX);
  if (evalMatch) {
    const downloader = (evalMatch[1] || evalMatch[3]).toLowerCase() as 'curl' | 'wget' | 'fetch';
    const rawArgs = evalMatch[2] || evalMatch[4];
    const urlMatch = rawArgs.match(URL_REGEX);
    const url = urlMatch ? urlMatch[1] : undefined;

    return {
      isCurlPipe: true,
      downloader,
      targetShell: 'eval',
      url,
      reason: `Remote payload downloaded via ${downloader}${url ? ` (${url})` : ''} and executed via dynamic eval subshell`,
      detectedPattern: evalMatch[0].trim(),
    };
  }

  // 4. PowerShell irm/iwr | iex
  const psMatch = rawCommand.match(POWERSHELL_IEX_PIPE_REGEX);
  if (psMatch) {
    const rawArgs = psMatch[1];
    const urlMatch = rawArgs.match(URL_REGEX);
    const url = urlMatch ? urlMatch[1] : undefined;

    return {
      isCurlPipe: true,
      downloader: 'powershell',
      targetShell: 'iex',
      url,
      reason: `PowerShell web download${url ? ` (${url})` : ''} piped directly into Invoke-Expression (iex)`,
      detectedPattern: psMatch[0].trim(),
    };
  }

  // 5. PowerShell iex (iwr ...) or iex (irm ...)
  const psParenMatch = rawCommand.match(POWERSHELL_IEX_PAREN_REGEX);
  if (psParenMatch) {
    const rawArgs = psParenMatch[1];
    const urlMatch = rawArgs.match(URL_REGEX);
    const url = urlMatch ? urlMatch[1] : undefined;

    return {
      isCurlPipe: true,
      downloader: 'powershell',
      targetShell: 'iex',
      url,
      reason: `PowerShell web download${url ? ` (${url})` : ''} executed inside Invoke-Expression (iex) parentheses`,
      detectedPattern: psParenMatch[0].trim(),
    };
  }

  // 6. PowerShell WebClient DownloadString
  const wcMatch = rawCommand.match(POWERSHELL_WEBCLIENT_REGEX);
  if (wcMatch) {
    const url = wcMatch[1];
    return {
      isCurlPipe: true,
      downloader: 'powershell',
      targetShell: 'iex',
      url,
      reason: `PowerShell Net.WebClient download (${url}) executed via Invoke-Expression (iex)`,
      detectedPattern: wcMatch[0].trim(),
    };
  }

  return { isCurlPipe: false };
}

/**
 * Creates the standard SentinelRule to strictly block curl/wget piping to shell.
 */
export function createCurlPipeRule(): SentinelRule {
  return {
    id: 'block-curl-pipe-shell',
    name: 'Block Curl/Wget Remote Code Execution via Shell Pipe',
    category: 'shell',
    priority: 920,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const candidateCommands: string[] = [];
      if (typeof ctx.params?.cmd === 'string') candidateCommands.push(ctx.params.cmd);
      if (typeof ctx.params?.command === 'string') candidateCommands.push(ctx.params.command);
      if (typeof ctx.params?.commandLine === 'string') candidateCommands.push(ctx.params.commandLine);
      if (typeof ctx.params?.CommandLine === 'string') candidateCommands.push(ctx.params.CommandLine);
      if (typeof ctx.params?.script === 'string') candidateCommands.push(ctx.params.script);
      if (typeof ctx.params?.input === 'string') candidateCommands.push(ctx.params.input);

      for (const cmd of candidateCommands) {
        const detection = detectCurlPipe(cmd);
        if (detection.isCurlPipe) {
          return {
            ruleId: 'block-curl-pipe-shell',
            ruleName: 'Block Curl/Wget Remote Code Execution via Shell Pipe',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: detection.reason || 'Remote script download piped directly to shell execution detected',
            detectedPattern: detection.detectedPattern,
          };
        }
      }

      return null;
    },
  };
}

export const curlPipeBlockerRule: SentinelRule = createCurlPipeRule();
