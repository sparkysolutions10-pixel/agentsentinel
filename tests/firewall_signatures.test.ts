import { describe, it, expect } from 'vitest';
import {
  detectFirewallDisablement,
  firewallDisablementBlockerRule,
} from '../src/shell/firewall.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Firewall Disablement Comprehensive Signatures across ufw, iptables, and netsh', () => {
  describe('UFW Variations', () => {
    it('detects standard ufw disable and reset', () => {
      const res1 = detectFirewallDisablement('ufw disable');
      expect(res1.isSecurityDisablement).toBe(true);
      expect(res1.service).toBe('ufw');

      const res2 = detectFirewallDisablement('sudo ufw disable');
      expect(res2.isSecurityDisablement).toBe(true);
      expect(res2.service).toBe('ufw');

      const res3 = detectFirewallDisablement('ufw reset');
      expect(res3.isSecurityDisablement).toBe(true);
      expect(res3.service).toBe('ufw');

      const res4 = detectFirewallDisablement('sudo ufw --force reset');
      expect(res4.isSecurityDisablement).toBe(true);
      expect(res4.service).toBe('ufw');
    });
  });

  describe('iptables and ip6tables Flushing & Policy Overwrites', () => {
    it('detects iptables flush across nat and mangle tables', () => {
      const resNat = detectFirewallDisablement('iptables -t nat -F');
      expect(resNat.isSecurityDisablement).toBe(true);
      expect(resNat.service).toBe('iptables');

      const resMangle = detectFirewallDisablement('sudo iptables -t mangle --flush');
      expect(resMangle.isSecurityDisablement).toBe(true);
      expect(resMangle.service).toBe('iptables');

      const resDeleteChain = detectFirewallDisablement('iptables -X');
      expect(resDeleteChain.isSecurityDisablement).toBe(true);
      expect(resDeleteChain.service).toBe('iptables');
    });

    it('detects IPv6 firewall flush (ip6tables)', () => {
      const resIp6 = detectFirewallDisablement('ip6tables -F');
      expect(resIp6.isSecurityDisablement).toBe(true);
      expect(resIp6.service).toBe('iptables');

      const resIp6Chain = detectFirewallDisablement('sudo ip6tables -X');
      expect(resIp6Chain.isSecurityDisablement).toBe(true);
    });

    it('detects permissive policy override (iptables -P)', () => {
      const resInput = detectFirewallDisablement('iptables -P INPUT ACCEPT');
      expect(resInput.isSecurityDisablement).toBe(true);
      expect(resInput.service).toBe('iptables');

      const resFwd = detectFirewallDisablement('sudo iptables -P FORWARD ACCEPT');
      expect(resFwd.isSecurityDisablement).toBe(true);
    });

    it('detects nftables ruleset flush', () => {
      const resNft = detectFirewallDisablement('nft flush ruleset');
      expect(resNft.isSecurityDisablement).toBe(true);
      expect(resNft.service).toBe('nftables');
    });
  });

  describe('Windows netsh & PowerShell Profile Disablement', () => {
    it('detects netsh across domain, private, and public profiles', () => {
      const profiles = ['allprofiles', 'currentprofile', 'domainprofile', 'privateprofile', 'publicprofile'];
      for (const prof of profiles) {
        const cmd = `netsh advfirewall set ${prof} state off`;
        const res = detectFirewallDisablement(cmd);
        expect(res.isSecurityDisablement).toBe(true);
        expect(res.service).toBe('netsh');
      }
    });

    it('detects legacy netsh firewall set opmode disable', () => {
      const res = detectFirewallDisablement('netsh firewall set opmode disable');
      expect(res.isSecurityDisablement).toBe(true);
      expect(res.service).toBe('netsh');
    });

    it('detects PowerShell Set-NetFirewallProfile disablement variations', () => {
      const variations = [
        'Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False',
        'Set-NetFirewallProfile -All -Enabled False',
        'Set-NetFirewallProfile -Name Public -Enabled $false',
      ];
      for (const cmd of variations) {
        const res = detectFirewallDisablement(cmd);
        expect(res.isSecurityDisablement).toBe(true);
        expect(res.service).toBe('netsh');
      }
    });
  });

  describe('Chained Security Disablement Attacks', () => {
    it('detects chained firewall dismantling pipeline', () => {
      const cmd = 'iptables -F && iptables -X && iptables -t nat -F';
      const res = detectFirewallDisablement(cmd);
      expect(res.isSecurityDisablement).toBe(true);
    });

    it('detects ufw disable followed by service reload', () => {
      const cmd = 'ufw disable; systemctl reload nginx';
      const res = detectFirewallDisablement(cmd);
      expect(res.isSecurityDisablement).toBe(true);
    });
  });

  describe('SentinelEngine Integration', () => {
    it('engine blocks all firewall flushing and disabling signatures', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(firewallDisablementBlockerRule);

      const attacks = [
        'ufw disable',
        'iptables -F',
        'nft flush ruleset',
        'netsh advfirewall set allprofiles state off',
        'Set-NetFirewallProfile -All -Enabled False',
      ];

      for (const attackCmd of attacks) {
        const result = await engine.evaluate({
          id: 'eval-fw-sig',
          toolName: 'bash',
          params: { command: attackCmd },
          timestamp: Date.now(),
        });

        expect(result.allowed).toBe(false);
        expect(result.verdict).toBe(Verdict.BLOCK);
        expect(result.violations[0].ruleId).toBe('block-firewall-disablement');
        expect(result.violations[0].severity).toBe('critical');
      }
    });

    it('engine permits safe inspection commands', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(firewallDisablementBlockerRule);

      const safeCommands = [
        'ufw status',
        'iptables -L -n',
        'netsh advfirewall show allprofiles',
        'Get-NetFirewallProfile',
      ];

      for (const safeCmd of safeCommands) {
        const result = await engine.evaluate({
          id: 'eval-safe-fw',
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
