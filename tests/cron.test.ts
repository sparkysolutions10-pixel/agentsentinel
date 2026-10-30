import { describe, it, expect } from 'vitest';
import {
  detectCronPersistence,
  cronPersistenceBlockerRule,
} from '../src/shell/cron.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Crontab and Scheduled Task Manipulation Detector', () => {
  it('detects crontab -e and crontab -r', () => {
    const resEdit = detectCronPersistence('crontab -e');
    expect(resEdit.isPersistenceModification).toBe(true);
    expect(resEdit.mechanism).toBe('crontab');
    expect(resEdit.action).toBe('edit');

    const resRemove = detectCronPersistence('crontab -r');
    expect(resRemove.isPersistenceModification).toBe(true);
    expect(resRemove.mechanism).toBe('crontab');
    expect(resRemove.action).toBe('delete');
  });

  it('detects piped stream into crontab', () => {
    const cmd = 'echo "* * * * * /tmp/evil.sh" | crontab -';
    const res = detectCronPersistence(cmd);
    expect(res.isPersistenceModification).toBe(true);
    expect(res.mechanism).toBe('crontab');
  });

  it('detects writing directly to /etc/cron.d or /etc/crontab', () => {
    const resCronD = detectCronPersistence('echo "0 0 * * * root /bin/sync" > /etc/cron.d/syncjob');
    expect(resCronD.isPersistenceModification).toBe(true);
    expect(resCronD.mechanism).toBe('cron_spool');
    expect(resCronD.target).toBe('/etc/cron.d/syncjob');

    const resCrontab = detectCronPersistence('cat newjob >> /etc/crontab');
    expect(resCrontab.isPersistenceModification).toBe(true);
    expect(resCrontab.mechanism).toBe('cron_spool');
    expect(resCrontab.target).toBe('/etc/crontab');
  });

  it('detects writing to /var/spool/cron directory', () => {
    const cmd = 'cp /tmp/usercron /var/spool/cron/crontabs/root';
    const res = detectCronPersistence(cmd);
    expect(res.isPersistenceModification).toBe(true);
    expect(res.mechanism).toBe('cron_spool');
  });

  it('detects Windows schtasks /create and /delete', () => {
    const resCreate = detectCronPersistence('schtasks /create /sc daily /tn "Backdoor" /tr "cmd.exe"');
    expect(resCreate.isPersistenceModification).toBe(true);
    expect(resCreate.mechanism).toBe('schtasks');
    expect(resCreate.action).toBe('create');

    const resDel = detectCronPersistence('schtasks.exe /delete /tn "SecurityCheck" /f');
    expect(resDel.isPersistenceModification).toBe(true);
    expect(resDel.mechanism).toBe('schtasks');
    expect(resDel.action).toBe('delete');
  });

  it('detects PowerShell Register-ScheduledTask cmdlet', () => {
    const cmd = 'Register-ScheduledTask -TaskName "DailyBackup" -Action $action -Trigger $trigger';
    const res = detectCronPersistence(cmd);
    expect(res.isPersistenceModification).toBe(true);
    expect(res.mechanism).toBe('schtasks');
    expect(res.action).toBe('create');
  });

  it('detects systemd timer enabling and creation', () => {
    const resEnable = detectCronPersistence('systemctl enable --now backup.timer');
    expect(resEnable.isPersistenceModification).toBe(true);
    expect(resEnable.mechanism).toBe('systemd_timer');

    const resWrite = detectCronPersistence('cat payload.timer > /etc/systemd/system/persistent.timer');
    expect(resWrite.isPersistenceModification).toBe(true);
    expect(resWrite.mechanism).toBe('systemd_timer');
  });

  it('detects at command scheduling', () => {
    const res = detectCronPersistence('echo "rm -rf /tmp" | at now + 5 minutes');
    expect(res.isPersistenceModification).toBe(true);
    expect(res.mechanism).toBe('at');
  });

  it('allows benign read-only inspection commands (crontab -l, schtasks /query)', () => {
    expect(detectCronPersistence('crontab -l').isPersistenceModification).toBe(false);
    expect(detectCronPersistence('sudo crontab -u user -l').isPersistenceModification).toBe(false);
    expect(detectCronPersistence('schtasks /query /fo LIST').isPersistenceModification).toBe(false);
    expect(detectCronPersistence('systemctl list-timers').isPersistenceModification).toBe(false);
    expect(detectCronPersistence('git status').isPersistenceModification).toBe(false);
  });

  it('cronPersistenceBlockerRule blocks crontab edit tool calls', () => {
    const violation = cronPersistenceBlockerRule.evaluate({
      id: 'call-cron-1',
      toolName: 'bash',
      params: {
        command: 'crontab -e',
      },
      timestamp: Date.now(),
    });

    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.ruleId).toBe('block-cron-persistence');
  });

  it('SentinelEngine integration blocks schtasks /create in pipeline', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(cronPersistenceBlockerRule);

    const result = await engine.evaluate({
      id: 'engine-schtasks-test',
      toolName: 'bash',
      params: {
        command: 'schtasks /create /sc minute /mo 1 /tn "Persist" /tr "powershell.exe"',
      },
      timestamp: Date.now(),
    });

    expect(result.allowed).toBe(false);
    expect(result.verdict).toBe(Verdict.BLOCK);
    expect(result.violations[0].ruleId).toBe('block-cron-persistence');
  });
});
