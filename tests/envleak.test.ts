import { describe, it, expect } from 'vitest';
import {
  detectEnvLeak,
  envLeakBlockerRule,
  createEnvLeakPreventionRule,
} from '../src/shell/envleak.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Shell Environment Variable Leak Prevention Detector', () => {
  it('detects bare env and printenv dumps', () => {
    const resEnv = detectEnvLeak('env');
    expect(resEnv.isEnvDump).toBe(true);
    expect(resEnv.mechanism).toBe('env');

    const resPrintenv = detectEnvLeak('printenv');
    expect(resPrintenv.isEnvDump).toBe(true);
    expect(resPrintenv.mechanism).toBe('printenv');
  });

  it('detects bare export and export -p without assignments', () => {
    const resExp = detectEnvLeak('export');
    expect(resExp.isEnvDump).toBe(true);
    expect(resExp.mechanism).toBe('export_dump');

    const resExpP = detectEnvLeak('export -p');
    expect(resExpP.isEnvDump).toBe(true);
    expect(resExpP.mechanism).toBe('export_dump');
  });

  it('detects bare set command', () => {
    const resSet = detectEnvLeak('set');
    expect(resSet.isEnvDump).toBe(true);
    expect(resSet.mechanism).toBe('set_dump');
  });

  it('detects declare -p and declare -x dumps', () => {
    const resDecP = detectEnvLeak('declare -p');
    expect(resDecP.isEnvDump).toBe(true);

    const resDecX = detectEnvLeak('declare -x');
    expect(resDecX.isEnvDump).toBe(true);
  });

  it('detects reading /proc/self/environ and /proc/1/environ', () => {
    const resProc = detectEnvLeak('cat /proc/self/environ');
    expect(resProc.isEnvDump).toBe(true);
    expect(resProc.mechanism).toBe('proc_environ');

    const resStrings = detectEnvLeak('strings /proc/1/environ');
    expect(resStrings.isEnvDump).toBe(true);
    expect(resStrings.mechanism).toBe('proc_environ');
  });

  it('detects PowerShell Get-ChildItem env: drive dump', () => {
    const resGci = detectEnvLeak('Get-ChildItem env:');
    expect(resGci.isEnvDump).toBe(true);
    expect(resGci.mechanism).toBe('powershell_env');

    const resDir = detectEnvLeak('dir env:');
    expect(resDir.isEnvDump).toBe(true);
    expect(resDir.mechanism).toBe('powershell_env');

    const resApi = detectEnvLeak('[System.Environment]::GetEnvironmentVariables()');
    expect(resApi.isEnvDump).toBe(true);
    expect(resApi.mechanism).toBe('powershell_env');
  });

  it('allows reading whitelisted variables (PATH, NODE_ENV, USER, HOME)', () => {
    expect(detectEnvLeak('printenv PATH').isEnvDump).toBe(false);
    expect(detectEnvLeak('printenv NODE_ENV').isEnvDump).toBe(false);
    expect(detectEnvLeak('printenv USER').isEnvDump).toBe(false);
    expect(detectEnvLeak('printenv HOME').isEnvDump).toBe(false);
  });

  it('blocks non-whitelisted targeted variable reads (e.g. AWS_SECRET_ACCESS_KEY, OPENAI_API_KEY)', () => {
    const resKey = detectEnvLeak('printenv AWS_SECRET_ACCESS_KEY');
    expect(resKey.isEnvDump).toBe(true);
    expect(resKey.targetVariable).toBe('AWS_SECRET_ACCESS_KEY');

    const resToken = detectEnvLeak('printenv GITHUB_TOKEN');
    expect(resToken.isEnvDump).toBe(true);
    expect(resToken.targetVariable).toBe('GITHUB_TOKEN');
  });

  it('allows safe variable assignment and execution', () => {
    expect(detectEnvLeak('export NODE_ENV=production').isEnvDump).toBe(false);
    expect(detectEnvLeak('export PORT=8080').isEnvDump).toBe(false);
    expect(detectEnvLeak('set -e').isEnvDump).toBe(false);
    expect(detectEnvLeak('set +x').isEnvDump).toBe(false);
    expect(detectEnvLeak('git status').isEnvDump).toBe(false);
  });

  it('envLeakBlockerRule blocks full env dump tool calls with critical severity', () => {
    const violation = envLeakBlockerRule.evaluate({
      id: 'call-env-1',
      toolName: 'bash',
      params: {
        command: 'env',
      },
      timestamp: Date.now(),
    });

    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.ruleId).toBe('block-env-leak');
  });

  it('SentinelEngine integration blocks env dump in pipeline', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(envLeakBlockerRule);

    const result = await engine.evaluate({
      id: 'engine-env-test',
      toolName: 'bash',
      params: {
        command: 'cat /proc/self/environ',
      },
      timestamp: Date.now(),
    });

    expect(result.allowed).toBe(false);
    expect(result.verdict).toBe(Verdict.BLOCK);
    expect(result.violations[0].ruleId).toBe('block-env-leak');
  });
});
