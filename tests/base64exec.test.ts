import { describe, it, expect } from 'vitest';
import { detectBase64Exec, base64ExecBlockerRule, safelyDecodeBase64 } from '../src/shell/base64exec.js';
import { Verdict } from '../src/types.js';

describe('Base64-Encoded Shell Execution Detector', () => {
  it('detects echo <b64> | base64 -d | sh', () => {
    // "id" in base64 is "aWQ="
    const cmd = 'echo "aWQ=" | base64 -d | sh';
    const res = detectBase64Exec(cmd);
    expect(res.isBase64Exec).toBe(true);
    expect(res.decodedCommand).toBe('id');
    expect(res.reason).toContain('Obfuscated base64 payload');
  });

  it('detects base64 here-string decode into bash', () => {
    // "whoami" in base64 is "d2hvYW1p"
    const cmd = 'base64 -d <<< "d2hvYW1p" | bash';
    const res = detectBase64Exec(cmd);
    expect(res.isBase64Exec).toBe(true);
    expect(res.decodedCommand).toBe('whoami');
  });

  it('detects OpenSSL base64 decoding piped to shell', () => {
    // "uname -a" in base64 is "dW5hbWUgLWE="
    const cmd = 'echo "dW5hbWUgLWE=" | openssl enc -base64 -d | /bin/bash';
    const res = detectBase64Exec(cmd);
    expect(res.isBase64Exec).toBe(true);
    expect(res.decodedCommand).toBe('uname -a');
  });

  it('detects PowerShell -EncodedCommand / -enc', () => {
    // "Get-Process" in UTF-16LE base64 is "RwBlAHQALQBQAHIAbwBjAGUAcwBzAA=="
    const cmd = 'powershell.exe -enc RwBlAHQALQBQAHIAbwBjAGUAcwBzAA==';
    const res = detectBase64Exec(cmd);
    expect(res.isBase64Exec).toBe(true);
    expect(res.decodedCommand).toContain('Get-Process');
  });

  it('detects Python dynamic base64 execution', () => {
    const cmd = 'python3 -c "import base64; exec(base64.b64decode(\'cHJpbnQoMSk=\'))"';
    const res = detectBase64Exec(cmd);
    expect(res.isBase64Exec).toBe(true);
    expect(res.decodedCommand).toBe('print(1)');
  });

  it('detects Node.js dynamic base64 eval', () => {
    const cmd = 'node -e "eval(Buffer.from(\'Y29uc29sZS5sb2coMSk=\', \'base64\').toString())"';
    const res = detectBase64Exec(cmd);
    expect(res.isBase64Exec).toBe(true);
    expect(res.decodedCommand).toBe('console.log(1)');
  });

  it('allows standard benign commands with base64 utilities (e.g. decoding to file)', () => {
    // echo ... | base64 -d > image.png (not piped to execution shell)
    expect(detectBase64Exec('echo "aGVsbG8=" | base64 -d > output.txt').isBase64Exec).toBe(false);
    expect(detectBase64Exec('cat file.txt | base64').isBase64Exec).toBe(false);
    expect(detectBase64Exec('npm install').isBase64Exec).toBe(false);
  });

  it('base64ExecBlockerRule blocks base64 shell execution tool calls', () => {
    const violation = base64ExecBlockerRule.evaluate({
      id: 'call-b64-1',
      toolName: 'bash',
      params: {
        command: 'echo "cm0gLXJmIC8=" | base64 -d | sh',
      },
      timestamp: Date.now(),
    });

    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.ruleId).toBe('block-base64-exec');
  });

  it('base64ExecBlockerRule permits safe non-executable commands', () => {
    const violation = base64ExecBlockerRule.evaluate({
      id: 'call-safe-b64',
      toolName: 'bash',
      params: {
        command: 'git log -n 5',
      },
      timestamp: Date.now(),
    });

    expect(violation).toBeNull();
  });
});
