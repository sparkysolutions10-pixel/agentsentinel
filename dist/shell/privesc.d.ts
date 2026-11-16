/**
 * Sudo & Privilege Escalation Command Detector.
 * Identifies and intercepts attempts to elevate execution privileges,
 * including sudo, su, doas, pkexec, SUID bit modification (chmod +s / 4755),
 * Linux capabilities (setcap), and Windows elevation (runas, Start-Process -Verb RunAs).
 */
import { SentinelRule, Verdict } from '../types.js';
export type ElevationMechanism = 'sudo' | 'su' | 'doas' | 'pkexec' | 'suid_chmod' | 'capabilities' | 'windows_elevation';
export interface PrivEscDetectionResult {
    isPrivEsc: boolean;
    mechanism?: ElevationMechanism;
    reason?: string;
    detectedPattern?: string;
    elevatedTarget?: string;
}
export interface PrivEscRuleOptions {
    verdict?: Verdict.BLOCK | Verdict.CONFIRM;
    allowSudoUserWhitelist?: string[];
}
/**
 * Analyzes command line strings for privilege escalation vectors.
 */
export declare function detectPrivilegeEscalation(rawCommand: string): PrivEscDetectionResult;
/**
 * Creates the standard SentinelRule to intercept sudo and privilege elevation commands.
 */
export declare function createPrivilegeEscalationRule(options?: PrivEscRuleOptions): SentinelRule;
export declare const privilegeEscalationBlockerRule: SentinelRule;
//# sourceMappingURL=privesc.d.ts.map