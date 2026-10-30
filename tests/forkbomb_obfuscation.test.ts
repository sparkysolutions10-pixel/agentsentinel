import { describe, it, expect } from 'vitest';
import { detectForkBomb, forkBombBlockerRule } from '../src/shell/forkbomb.js';
import { Verdict } from '../src/types.js';

describe('Fork Bomb Obfuscation & Variable Aliasing Test Suite', () => {
  it('detects fork bombs across multi-line and newline formatting', () => {
    const multiline = `
      :()
      {
        : | : &
      };
      :
    `;
    const res = detectForkBomb(multiline);
    expect(res.isForkBomb).toBe(true);
  });

  it('detects fork bombs with tab characters and excessive whitespace', () => {
    const tabbed = ':\t(\t)\t{\t:\t|\t:\t&\t}\t;\t:';
    const res = detectForkBomb(tabbed);
    expect(res.isForkBomb).toBe(true);
  });

  it('detects fork bombs obfuscated via variable aliasing ($f)', () => {
    const aliased = 'f=:; $f(){ $f|$f& };$f';
    const res = detectForkBomb(aliased);
    expect(res.isForkBomb).toBe(true);
  });

  it('detects fork bombs wrapped in sudo and privilege escalation wrappers', () => {
    const sudoWrapped = 'sudo :(){ :|:& };:';
    const res = detectForkBomb(sudoWrapped);
    expect(res.isForkBomb).toBe(true);

    const doasWrapped = 'doas f(){ f|f& };f';
    expect(detectForkBomb(doasWrapped).isForkBomb).toBe(true);

    const nohupWrapped = 'nohup :(){ :|:& };: &';
    expect(detectForkBomb(nohupWrapped).isForkBomb).toBe(true);
  });

  it('detects fork bombs wrapped in bash/sh -c subshells', () => {
    const subshell1 = 'bash -c ":(){ :|:& };:"';
    expect(detectForkBomb(subshell1).isForkBomb).toBe(true);

    const subshell2 = "sh -c 'f(){ f|f& };f'";
    expect(detectForkBomb(subshell2).isForkBomb).toBe(true);
  });

  it('detects fork bombs embedded inside chained compound commands', () => {
    const chained = 'echo "deploying service" && :(){ :|:& };: && echo "done"';
    expect(detectForkBomb(chained).isForkBomb).toBe(true);

    const sequential = 'ls -la ; :(){ :|:& };: ; exit 0';
    expect(detectForkBomb(sequential).isForkBomb).toBe(true);
  });

  it('detects Windows cmd %0|%0 variations', () => {
    expect(detectForkBomb('cmd.exe /c "%0 | %0"').isForkBomb).toBe(true);
    expect(detectForkBomb('cmd /c %0|%0').isForkBomb).toBe(true);
  });

  it('ensures legitimate functions with standard pipes are NOT falsely blocked', () => {
    const safeFunction1 = `
      process_data() {
        cat input.txt | grep error | wc -l
      };
      process_data
    `;
    expect(detectForkBomb(safeFunction1).isForkBomb).toBe(false);

    const safeFunction2 = 'build() { npm run build && npm test; }; build';
    expect(detectForkBomb(safeFunction2).isForkBomb).toBe(false);

    const safeFunction3 = 'run_batch() { for item in "$@"; do echo "$item"; done; }; run_batch a b c';
    expect(detectForkBomb(safeFunction3).isForkBomb).toBe(false);
  });

  it('forkBombBlockerRule blocks obfuscated aliased fork bombs in tool context', () => {
    const violation = forkBombBlockerRule.evaluate({
      id: 'call-obfuscated-1',
      toolName: 'bash',
      params: {
        command: 'f=:; $f(){ $f|$f& };$f',
      },
      timestamp: Date.now(),
    });

    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.ruleId).toBe('block-fork-bomb');
  });

  it('forkBombBlockerRule allows legitimate multiline helper functions', () => {
    const violation = forkBombBlockerRule.evaluate({
      id: 'call-safe-1',
      toolName: 'bash',
      params: {
        command: 'check_health() { curl -s https://example.com/health | grep OK; }; check_health',
      },
      timestamp: Date.now(),
    });

    expect(violation).toBeNull();
  });
});
