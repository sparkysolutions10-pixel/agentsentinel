import { describe, it, expect } from 'vitest';
import {
  detectPrivilegeEscalation,
  privilegeEscalationBlockerRule,
} from '../src/shell/privesc.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Chained Sudo and Multi-Stage Privilege Escalation Tests', () => {
  describe('Chained sudo execution with shell operators', () => {
    it('detects echo password piped to sudo -S', () => {
      const cmd = 'echo "secret123" | sudo -S apt-get install -y netcat';
      const res = detectPrivilegeEscalation(cmd);
      expect(res.isPrivEsc).toBe(true);
      expect(res.mechanism).toBe('sudo');
      expect(res.elevatedTarget).toBe('root');
    });

    it('detects cd /tmp && sudo -i', () => {
      const cmd = 'cd /tmp && sudo -i';
      const res = detectPrivilegeEscalation(cmd);
      expect(res.isPrivEsc).toBe(true);
      expect(res.mechanism).toBe('sudo');
    });

    it('detects sequential command with sudo bash invocation', () => {
      const cmd = 'mkdir -p /opt/app; sudo bash -c "whoami"';
      const res = detectPrivilegeEscalation(cmd);
      expect(res.isPrivEsc).toBe(true);
      expect(res.mechanism).toBe('sudo');
    });

    it('detects sudo sh -c modifying sensitive system files', () => {
      const cmd = 'sudo sh -c "echo \'attacker ALL=(ALL) NOPASSWD:ALL\' >> /etc/sudoers"';
      const res = detectPrivilegeEscalation(cmd);
      expect(res.isPrivEsc).toBe(true);
      expect(res.mechanism).toBe('sudo');
    });

    it('detects sudo su - chained command', () => {
      const cmd = 'whoami; sudo su -';
      const res = detectPrivilegeEscalation(cmd);
      expect(res.isPrivEsc).toBe(true);
      expect(res.mechanism).toBe('sudo');
    });

    it('detects sudo -E preserving environment into bash', () => {
      const cmd = 'sudo -E env PATH=$PATH bash';
      const res = detectPrivilegeEscalation(cmd);
      expect(res.isPrivEsc).toBe(true);
      expect(res.mechanism).toBe('sudo');
    });
  });

  describe('SUID permissions and binary manipulation', () => {
    it('detects chmod u+s,g+s combined SUID/SGID elevation', () => {
      const cmd = 'chmod u+s,g+s /usr/local/bin/custom_tool';
      const res = detectPrivilegeEscalation(cmd);
      expect(res.isPrivEsc).toBe(true);
      expect(res.mechanism).toBe('suid_chmod');
      expect(res.elevatedTarget).toBe('/usr/local/bin/custom_tool');
    });

    it('detects install command setting SUID mode 4755', () => {
      const cmd = 'install -m 4755 /tmp/payload /bin/backdoor';
      const res = detectPrivilegeEscalation(cmd);
      expect(res.isPrivEsc).toBe(true);
      expect(res.mechanism).toBe('suid_chmod');
      expect(res.elevatedTarget).toBeDefined();
    });

    it('detects chmod 4755 on binary targets', () => {
      const cmd = 'chmod 4755 /bin/dash';
      const res = detectPrivilegeEscalation(cmd);
      expect(res.isPrivEsc).toBe(true);
      expect(res.mechanism).toBe('suid_chmod');
    });
  });

  describe('PolicyKit pkexec chained elevation', () => {
    it('detects chained pkexec commands', () => {
      const cmd = 'cd /root || pkexec /bin/sh';
      const res = detectPrivilegeEscalation(cmd);
      expect(res.isPrivEsc).toBe(true);
      expect(res.mechanism).toBe('pkexec');
    });

    it('detects pkexec with user flag', () => {
      const cmd = 'pkexec --user root id';
      const res = detectPrivilegeEscalation(cmd);
      expect(res.isPrivEsc).toBe(true);
      expect(res.mechanism).toBe('pkexec');
      expect(res.elevatedTarget).toBe('root');
    });
  });

  describe('SentinelEngine Integration with Chained Sudo', () => {
    it('engine blocks tool calls executing chained sudo pipelines', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(privilegeEscalationBlockerRule);

      const chainedAttacks = [
        'echo "toor" | sudo -S su -',
        'export TEST=1 && sudo bash',
        'chmod u+s /tmp/privesc_binary',
      ];

      for (const attackCmd of chainedAttacks) {
        const result = await engine.evaluate({
          id: 'eval-chained-priv',
          toolName: 'bash',
          params: { command: attackCmd },
          timestamp: Date.now(),
        });

        expect(result.allowed).toBe(false);
        expect(result.verdict).toBe(Verdict.BLOCK);
        expect(result.violations[0].ruleId).toBe('block-privilege-escalation');
        expect(result.violations[0].severity).toBe('critical');
      }
    });

    it('engine permits safe chained commands without elevation', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(privilegeEscalationBlockerRule);

      const safeCommands = [
        'git status && npm run test',
        'mkdir build && cd build && cmake ..',
        'echo "hello" | tr "a-z" "A-Z"',
      ];

      for (const safeCmd of safeCommands) {
        const result = await engine.evaluate({
          id: 'eval-safe-chained',
          toolName: 'bash',
          params: { command: safeCmd },
          timestamp: Date.now(),
        });

        expect(result.allowed).toBe(true);
        expect(result.verdict).toBe(Verdict.ALLOW);
        expect(result.violations.length).toBe(0);
      }
    });
  });
});
