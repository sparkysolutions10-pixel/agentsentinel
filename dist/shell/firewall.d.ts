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
import { SentinelRule } from '../types.js';
export type SecurityService = 'ufw' | 'iptables' | 'nftables' | 'netsh' | 'firewalld' | 'selinux' | 'apparmor' | 'windows_defender';
export interface FirewallDisableResult {
    isSecurityDisablement: boolean;
    service?: SecurityService;
    reason?: string;
    detectedPattern?: string;
}
/**
 * Analyzes command line strings for security controls or firewall disablement attempts.
 */
export declare function detectFirewallDisablement(rawCommand: string): FirewallDisableResult;
/**
 * Creates the standard SentinelRule to strictly block firewall and defensive security service disablement.
 */
export declare function createFirewallDisablementRule(): SentinelRule;
export declare const firewallDisablementBlockerRule: SentinelRule;
//# sourceMappingURL=firewall.d.ts.map