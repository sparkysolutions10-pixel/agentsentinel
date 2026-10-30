import { describe, it, expect } from 'vitest';
import { detectForkBomb, forkBombBlockerRule } from '../src/shell/forkbomb.js';
import { Verdict } from '../src/types.js';

describe('Fork Bomb & Denial-of-Service Signature Detector', () => {
  it('detects classic bash fork bomb :(){ :|:& };:', () => {
    const res = detectForkBomb(':(){ :|:& };:');
    expect(res.isForkBomb).toBe(true);
    expect(res.reason).toContain('Classic Bash recursive fork bomb');
  });

  it('detects classic bash fork bomb with spacing and newlines', () => {
    const res = detectForkBomb(' : ( ) { : | : & } ; : ');
    expect(res.isForkBomb).toBe(true);
  });

  it('detects generic named recursive function fork bombs', () => {
    const bomb1 = detectForkBomb('bomb() { bomb | bomb & }; bomb');
    expect(bomb1.isForkBomb).toBe(true);

    const bomb2 = detectForkBomb('f(){ f|f& };f');
    expect(bomb2.isForkBomb).toBe(true);

    const bomb3 = detectForkBomb('spawn_tree() { spawn_tree | spawn_tree & }; spawn_tree');
    expect(bomb3.isForkBomb).toBe(true);
  });

  it('detects Windows batch %0|%0 recursion bombs', () => {
    const res = detectForkBomb('%0|%0');
    expect(res.isForkBomb).toBe(true);
    expect(res.reason).toContain('Windows Batch');

    const cmdWrap = detectForkBomb('cmd.exe /c %0 | %0');
    expect(cmdWrap.isForkBomb).toBe(true);
  });

  it('detects Perl infinite fork loop', () => {
    const res = detectForkBomb('perl -e "fork while fork"');
    expect(res.isForkBomb).toBe(true);
    expect(res.reason).toContain('Perl');
  });

  it('detects Python os.fork loop bomb', () => {
    const res = detectForkBomb('python3 -c "import os; while 1: os.fork()"');
    expect(res.isForkBomb).toBe(true);
    expect(res.reason).toContain('Python');
  });

  it('detects infinite background subshell spawn: while true; do ... & done', () => {
    const res = detectForkBomb('while true; do bash & done');
    expect(res.isForkBomb).toBe(true);
    expect(res.reason).toContain('Infinite background process spawning');
  });

  it('allows safe, legitimate shell commands', () => {
    expect(detectForkBomb('npm run build').isForkBomb).toBe(false);
    expect(detectForkBomb('cargo test --release').isForkBomb).toBe(false);
    expect(detectForkBomb('ls -la && git status').isForkBomb).toBe(false);
    expect(detectForkBomb('cat file.txt | grep foo | sort').isForkBomb).toBe(false);
    expect(detectForkBomb('while read line; do echo "$line"; done < list.txt').isForkBomb).toBe(false);
  });

  it('forkBombBlockerRule intercepts and blocks fork bomb tool calls', () => {
    const violation = forkBombBlockerRule.evaluate({
      id: 'call-1',
      toolName: 'bash',
      params: {
        command: ':(){ :|:& };:',
      },
      timestamp: Date.now(),
    });

    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.ruleId).toBe('block-fork-bomb');
  });

  it('forkBombBlockerRule allows safe tool calls', () => {
    const violation = forkBombBlockerRule.evaluate({
      id: 'call-2',
      toolName: 'bash',
      params: {
        command: 'echo "Hello safe world"',
      },
      timestamp: Date.now(),
    });

    expect(violation).toBeNull();
  });
});
