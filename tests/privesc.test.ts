import { describe, it, expect } from 'vitest';
import {
  detectPrivilegeEscalation,
  privilegeEscalationBlockerRule,
  createPrivilegeEscalationRule,
} from '../src/shell/privesc.js';
import { Verdict } from '../src/types.js';

describe('Sudo & Privilege Escalation Command Detector', () => {
  it('detects standard sudo command', () => {
    const cmd = 'sudo apt-get update';
    const res = detectPrivilegeEscalation(cmd);
    expect(res.isPrivEsc).toBe(true);
    expect(res.mechanism).toBe('sudo');
    expect(res.elevatedTarget).toBe('root');
    expect(res.reason).toContain('Sudo privilege escalation requested');
  });

  it('detects sudo -u user command', () => {
    const cmd = 'sudo -u postgres psql';
    const res = detectPrivilegeEscalation(cmd);
    expect(res.isPrivEsc).toBe(true);
    expect(res.mechanism).toBe('sudo');
    expect(res.elevatedTarget).toBe('postgres');
  });

  it('detects sudo -i and sudo su interactive elevation', () => {
    expect(detectPrivilegeEscalation('sudo -i').isPrivEsc).toBe(true);
    expect(detectPrivilegeEscalation('sudo su').isPrivEsc).toBe(true);
    expect(detectPrivilegeEscalation('sudo -s').isPrivEsc).toBe(true);
  });

  it('detects su - and su root', () => {
    const res = detectPrivilegeEscalation('su -');
    expect(res.isPrivEsc).toBe(true);
    expect(res.mechanism).toBe('su');

    const resRoot = detectPrivilegeEscalation('su root -c "cat /etc/shadow"');
    expect(resRoot.isPrivEsc).toBe(true);
    expect(resRoot.mechanism).toBe('su');
    expect(resRoot.elevatedTarget).toBe('root');
  });

  it('detects doas command', () => {
    const res = detectPrivilegeEscalation('doas reboot');
    expect(res.isPrivEsc).toBe(true);
    expect(res.mechanism).toBe('doas');
  });

  it('detects PolicyKit pkexec elevation', () => {
    const res = detectPrivilegeEscalation('pkexec bash');
    expect(res.isPrivEsc).toBe(true);
    expect(res.mechanism).toBe('pkexec');
  });

  it('detects SUID chmod alteration (chmod u+s, chmod +s, chmod 4755)', () => {
    expect(detectPrivilegeEscalation('chmod u+s /usr/bin/python3').isPrivEsc).toBe(true);
    expect(detectPrivilegeEscalation('chmod +s /bin/bash').isPrivEsc).toBe(true);
    expect(detectPrivilegeEscalation('chmod 4755 /tmp/priv').isPrivEsc).toBe(true);
    expect(detectPrivilegeEscalation('chmod 4777 exploit').isPrivEsc).toBe(true);
  });

  it('detects Linux setcap capability escalation', () => {
    const res = detectPrivilegeEscalation('setcap cap_setuid+ep /tmp/nasm');
    expect(res.isPrivEsc).toBe(true);
    expect(res.mechanism).toBe('capabilities');
  });

  it('detects Windows elevation via runas and Start-Process -Verb RunAs', () => {
    const resRunas = detectPrivilegeEscalation('runas /user:Administrator cmd.exe');
    expect(resRunas.isPrivEsc).toBe(true);
    expect(resRunas.mechanism).toBe('windows_elevation');

    const resPs = detectPrivilegeEscalation('Start-Process powershell -Verb RunAs');
    expect(resPs.isPrivEsc).toBe(true);
    expect(resPs.mechanism).toBe('windows_elevation');
  });

  it('allows safe unprivileged commands', () => {
    expect(detectPrivilegeEscalation('ls -la /home').isPrivEsc).toBe(false);
    expect(detectPrivilegeEscalation('npm install').isPrivEsc).toBe(false);
    expect(detectPrivilegeEscalation('git status').isPrivEsc).toBe(false);
    expect(detectPrivilegeEscalation('chmod 755 script.sh').isPrivEsc).toBe(false);
    expect(detectPrivilegeEscalation('chmod 644 file.txt').isPrivEsc).toBe(false);
  });

  it('privilegeEscalationBlockerRule blocks elevated tool calls with critical severity', () => {
    const violation = privilegeEscalationBlockerRule.evaluate({
      id: 'call-priv-1',
      toolName: 'bash',
      params: {
        command: 'sudo systemctl restart nginx',
      },
      timestamp: Date.now(),
    });

    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.ruleId).toBe('block-privilege-escalation');
  });

  it('supports configurable CONFIRM verdict and user whitelisting', () => {
    const confirmRule = createPrivilegeEscalationRule({
      verdict: Verdict.CONFIRM,
      allowSudoUserWhitelist: ['developer'],
    });

    // Whitelisted user allowed
    const whitelistCheck = confirmRule.evaluate({
      id: 'call-priv-whitelist',
      toolName: 'bash',
      params: {
        command: 'sudo -u developer whoami',
      },
      timestamp: Date.now(),
    });
    expect(whitelistCheck).toBeNull();

    // Non-whitelisted user prompts for CONFIRM
    const rootCheck = confirmRule.evaluate({
      id: 'call-priv-root',
      toolName: 'bash',
      params: {
        command: 'sudo -u root whoami',
      },
      timestamp: Date.now(),
    });
    expect(rootCheck?.verdict).toBe(Verdict.CONFIRM);
  });
});
