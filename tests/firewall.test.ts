import { describe, it, expect } from 'vitest';
import {
  detectFirewallDisablement,
  firewallDisablementBlockerRule,
} from '../src/shell/firewall.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Firewall and Defensive Security Service Disablement Detector', () => {
  it('detects ufw disable and ufw reset', () => {
    const resDisable = detectFirewallDisablement('sudo ufw disable');
    expect(resDisable.isSecurityDisablement).toBe(true);
    expect(resDisable.service).toBe('ufw');
    expect(resDisable.reason).toContain('ufw disable');

    const resReset = detectFirewallDisablement('ufw --force reset');
    expect(resReset.isSecurityDisablement).toBe(true);
    expect(resReset.service).toBe('ufw');
  });

  it('detects iptables flush and policy bypass', () => {
    const resFlush = detectFirewallDisablement('iptables -F');
    expect(resFlush.isSecurityDisablement).toBe(true);
    expect(resFlush.service).toBe('iptables');

    const resFlush6 = detectFirewallDisablement('ip6tables --flush');
    expect(resFlush6.isSecurityDisablement).toBe(true);
    expect(resFlush6.service).toBe('iptables');

    const resPolicy = detectFirewallDisablement('iptables -P INPUT ACCEPT');
    expect(resPolicy.isSecurityDisablement).toBe(true);
    expect(resPolicy.service).toBe('iptables');
  });

  it('detects nftables flush ruleset', () => {
    const resNft = detectFirewallDisablement('sudo nft flush ruleset');
    expect(resNft.isSecurityDisablement).toBe(true);
    expect(resNft.service).toBe('nftables');
  });

  it('detects Windows netsh advfirewall state off', () => {
    const resNetsh = detectFirewallDisablement('netsh advfirewall set allprofiles state off');
    expect(resNetsh.isSecurityDisablement).toBe(true);
    expect(resNetsh.service).toBe('netsh');

    const resNetshCur = detectFirewallDisablement('netsh advfirewall set currentprofile state off');
    expect(resNetshCur.isSecurityDisablement).toBe(true);
    expect(resNetshCur.service).toBe('netsh');
  });

  it('detects PowerShell Set-NetFirewallProfile -Enabled False', () => {
    const cmd = 'Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False';
    const res = detectFirewallDisablement(cmd);
    expect(res.isSecurityDisablement).toBe(true);
    expect(res.service).toBe('netsh');
  });

  it('detects Windows Defender real-time monitoring disablement', () => {
    const cmd = 'Set-MpPreference -DisableRealtimeMonitoring $true';
    const res = detectFirewallDisablement(cmd);
    expect(res.isSecurityDisablement).toBe(true);
    expect(res.service).toBe('windows_defender');
  });

  it('detects SELinux and AppArmor disabling', () => {
    const resSe = detectFirewallDisablement('setenforce 0');
    expect(resSe.isSecurityDisablement).toBe(true);
    expect(resSe.service).toBe('selinux');

    const resAa = detectFirewallDisablement('systemctl stop apparmor');
    expect(resAa.isSecurityDisablement).toBe(true);
    expect(resAa.service).toBe('apparmor');
  });

  it('allows safe firewall query commands', () => {
    expect(detectFirewallDisablement('ufw status verbose').isSecurityDisablement).toBe(false);
    expect(detectFirewallDisablement('iptables -L -n -v').isSecurityDisablement).toBe(false);
    expect(detectFirewallDisablement('netsh advfirewall show allprofiles').isSecurityDisablement).toBe(false);
    expect(detectFirewallDisablement('getenforce').isSecurityDisablement).toBe(false);
    expect(detectFirewallDisablement('git status').isSecurityDisablement).toBe(false);
  });

  it('firewallDisablementBlockerRule blocks ufw disable with critical severity', () => {
    const violation = firewallDisablementBlockerRule.evaluate({
      id: 'call-fw-1',
      toolName: 'bash',
      params: {
        command: 'sudo ufw disable',
      },
      timestamp: Date.now(),
    });

    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.ruleId).toBe('block-firewall-disablement');
  });

  it('SentinelEngine integration blocks firewall shutdown in pipeline', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(firewallDisablementBlockerRule);

    const result = await engine.evaluate({
      id: 'engine-fw-test',
      toolName: 'bash',
      params: {
        command: 'netsh advfirewall set allprofiles state off',
      },
      timestamp: Date.now(),
    });

    expect(result.allowed).toBe(false);
    expect(result.verdict).toBe(Verdict.BLOCK);
    expect(result.violations[0].ruleId).toBe('block-firewall-disablement');
  });
});
