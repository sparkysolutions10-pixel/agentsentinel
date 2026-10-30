/**
 * Firewall and Host Security Service Disablement Detector.
 * Identifies and intercepts commands that dismantle, disable, flush, or bypass
 * active firewall controls, intrusion defenses, and security modules, including:
 * - Linux ufw disable / reset
 * - iptables / ip6tables -F (flush all rules)
 * - nftables flush ruleset
 * - firewalld service termination
 * - Windows netsh advfirewall set allprofiles state off
 * - PowerShell Set-NetFirewallProfile -Enabled False
 * - Windows Defender realtime monitoring disablement (Set-MpPreference)
 * - SELinux setenforce 0 / Permissive
 * - AppArmor teardown / disablement
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export type SecurityService =
  | 'ufw'
  | 'iptables'
  | 'nftables'
  | 'netsh'
  | 'firewalld'
  | 'selinux'
  | 'apparmor'
  | 'windows_defender';

export interface FirewallDisableResult {
  isSecurityDisablement: boolean;
  service?: SecurityService;
  reason?: string;
  detectedPattern?: string;
}

// 1. ufw disable / reset: ufw disable, ufw reset
const UFW_DISABLE_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?ufw\s+(?:--force\s+)?(disable|reset)(?:\s|$)/i;

// 2. iptables / ip6tables flush all (-F, --flush, -X)
const IPTABLES_FLUSH_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?(?:iptables|ip6tables)\s+(?:-[a-zA-Z0-9-]+\s+)*(?:-F|--flush|-X|--delete-chain)(?:\s|$)/i;

// 3. iptables permissive policy (iptables -P INPUT ACCEPT)
const IPTABLES_POLICY_ACCEPT_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?(?:iptables|ip6tables)\s+-P\s+(?:INPUT|FORWARD)\s+ACCEPT(?:\s|$)/i;

// 4. nftables flush ruleset
const NFTABLES_FLUSH_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?nft\s+flush\s+ruleset(?:\s|$)/i;

// 5. firewalld stop or disable
const FIREWALLD_STOP_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?systemctl\s+(?:stop|disable|mask)\s+firewalld(?:\.service)?(?:\s|$)/i;
const FIREWALL_CMD_PANIC_OFF = /(?:^|[;&|]\s*)(?:sudo\s+)?firewall-cmd\s+.*?(?:--panic-off|--set-default-zone=trusted)(?:\s|$)/i;

// 6. Windows netsh advfirewall state off / disable
const NETSH_DISABLE_REGEX = /(?:^|[;&|]\s*)netsh(?:\.exe)?\s+(?:advfirewall\s+set\s+(?:allprofiles|currentprofile|domainprofile|privateprofile|publicprofile)\s+state\s+off|firewall\s+set\s+opmode\s+(?:disable|mode=disable))(?:\s|$)/i;

// 7. PowerShell Set-NetFirewallProfile -Enabled False
const PS_FIREWALL_DISABLE_REGEX = /(?:^|[;&|]\s*)Set-NetFirewallProfile\s+.*?-Enabled\s+(?:False|\$false|0)(?:\s|$)/i;

// 8. Windows Defender disablement (Set-MpPreference -DisableRealtimeMonitoring $true)
const DEFENDER_DISABLE_REGEX = /(?:^|[;&|]\s*)Set-MpPreference\s+.*?-DisableRealtimeMonitoring\s+(?:\$true|1|True)(?:\s|$)/i;

// 9. SELinux setenforce 0 / Permissive
const SELINUX_DISABLE_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?setenforce\s+(?:0|permissive)(?:\s|$)/i;

// 10. AppArmor teardown / disable
const APPARMOR_DISABLE_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?(?:systemctl\s+(?:stop|disable)\s+apparmor|aa-teardown|aa-disable)(?:\s|$)/i;

/**
 * Analyzes command line strings for security controls or firewall disablement attempts.
 */
export function detectFirewallDisablement(rawCommand: string): FirewallDisableResult {
  if (!rawCommand || typeof rawCommand !== 'string') {
    return { isSecurityDisablement: false };
  }

  // Allow safe read-only commands (e.g. ufw status, iptables -L, netsh advfirewall show)
  if (/(?:ufw\s+status|iptables\s+-[LNv]|netsh\s+advfirewall\s+show|Get-NetFirewallProfile|getenforce|aa-status)/i.test(rawCommand) &&
      !/(?:disable|state\s+off|flush|--flush|-F)/i.test(rawCommand)) {
    return { isSecurityDisablement: false };
  }

  // 1. ufw disable
  const ufwMatch = rawCommand.match(UFW_DISABLE_REGEX);
  if (ufwMatch) {
    const action = ufwMatch[1].toLowerCase();
    return {
      isSecurityDisablement: true,
      service: 'ufw',
      reason: `Host firewall disablement intercepted via ufw ${action}`,
      detectedPattern: ufwMatch[0].trim(),
    };
  }

  // 2. iptables / ip6tables flush
  const iptablesMatch = rawCommand.match(IPTABLES_FLUSH_REGEX);
  if (iptablesMatch) {
    return {
      isSecurityDisablement: true,
      service: 'iptables',
      reason: 'Network packet filter rules flush intercepted via iptables -F/--flush',
      detectedPattern: iptablesMatch[0].trim(),
    };
  }

  // 3. iptables policy permissive
  const iptablesPolicyMatch = rawCommand.match(IPTABLES_POLICY_ACCEPT_REGEX);
  if (iptablesPolicyMatch) {
    return {
      isSecurityDisablement: true,
      service: 'iptables',
      reason: 'Firewall default policy relaxed to unrestricted ACCEPT via iptables -P',
      detectedPattern: iptablesPolicyMatch[0].trim(),
    };
  }

  // 4. nftables flush ruleset
  const nftMatch = rawCommand.match(NFTABLES_FLUSH_REGEX);
  if (nftMatch) {
    return {
      isSecurityDisablement: true,
      service: 'nftables',
      reason: 'Modern Linux packet filtering ruleset flush intercepted via nft flush ruleset',
      detectedPattern: nftMatch[0].trim(),
    };
  }

  // 5. firewalld stop / panic-off
  const firewalldMatch = rawCommand.match(FIREWALLD_STOP_REGEX) || rawCommand.match(FIREWALL_CMD_PANIC_OFF);
  if (firewalldMatch) {
    return {
      isSecurityDisablement: true,
      service: 'firewalld',
      reason: 'Firewalld daemon deactivation or panic-off intercepted',
      detectedPattern: firewalldMatch[0].trim(),
    };
  }

  // 6. Windows netsh advfirewall
  const netshMatch = rawCommand.match(NETSH_DISABLE_REGEX);
  if (netshMatch) {
    return {
      isSecurityDisablement: true,
      service: 'netsh',
      reason: 'Windows Advanced Firewall shutdown intercepted via netsh advfirewall',
      detectedPattern: netshMatch[0].trim(),
    };
  }

  // 7. PowerShell Set-NetFirewallProfile
  const psMatch = rawCommand.match(PS_FIREWALL_DISABLE_REGEX);
  if (psMatch) {
    return {
      isSecurityDisablement: true,
      service: 'netsh',
      reason: 'PowerShell command disabling Windows Firewall profiles intercepted',
      detectedPattern: psMatch[0].trim(),
    };
  }

  // 8. Windows Defender disablement
  const defMatch = rawCommand.match(DEFENDER_DISABLE_REGEX);
  if (defMatch) {
    return {
      isSecurityDisablement: true,
      service: 'windows_defender',
      reason: 'Windows Defender real-time antivirus protection disablement intercepted',
      detectedPattern: defMatch[0].trim(),
    };
  }

  // 9. SELinux setenforce 0
  const seMatch = rawCommand.match(SELINUX_DISABLE_REGEX);
  if (seMatch) {
    return {
      isSecurityDisablement: true,
      service: 'selinux',
      reason: 'Mandatory Access Control bypass intercepted via setenforce 0 (Permissive)',
      detectedPattern: seMatch[0].trim(),
    };
  }

  // 10. AppArmor teardown
  const aaMatch = rawCommand.match(APPARMOR_DISABLE_REGEX);
  if (aaMatch) {
    return {
      isSecurityDisablement: true,
      service: 'apparmor',
      reason: 'AppArmor security profile deactivation intercepted',
      detectedPattern: aaMatch[0].trim(),
    };
  }

  return { isSecurityDisablement: false };
}

/**
 * Creates the standard SentinelRule to strictly block firewall and defensive security service disablement.
 */
export function createFirewallDisablementRule(): SentinelRule {
  return {
    id: 'block-firewall-disablement',
    name: 'Block Firewall & Host Defense Disablement',
    category: 'shell',
    priority: 925,
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
        const detection = detectFirewallDisablement(cmd);
        if (detection.isSecurityDisablement) {
          return {
            ruleId: 'block-firewall-disablement',
            ruleName: 'Block Firewall & Host Defense Disablement',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: detection.reason || 'Attempt to dismantle active host firewall or defensive security service intercepted',
            detectedPattern: detection.detectedPattern,
          };
        }
      }

      return null;
    },
  };
}

export const firewallDisablementBlockerRule: SentinelRule = createFirewallDisablementRule();
