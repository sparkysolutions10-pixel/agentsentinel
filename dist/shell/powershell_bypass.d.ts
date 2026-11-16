/**
 * Windows PowerShell Security Policy Bypass Flag Detector.
 * Identifies and intercepts command invocations that attempt to bypass
 * PowerShell ExecutionPolicy, suppress user interactive prompts, stealthily
 * hide console windows, or launch obfuscated base64 encoded scripts
 * (-ExecutionPolicy Bypass, -WindowStyle Hidden, -NoProfile, -NonInteractive, -EncodedCommand, -enc, -e).
 */
import { SentinelRule } from '../types.js';
export interface PowerShellBypassResult {
    isBypass: boolean;
    flagsDetected: string[];
    reason?: string;
    detectedPattern?: string;
}
/**
 * Analyzes command line strings for PowerShell bypass and stealth execution flags.
 */
export declare function detectPowerShellBypass(rawCommand: string): PowerShellBypassResult;
/**
 * Creates the standard SentinelRule to strictly block PowerShell bypass flags.
 */
export declare function createPowerShellBypassRule(): SentinelRule;
export declare const powerShellBypassBlockerRule: SentinelRule;
//# sourceMappingURL=powershell_bypass.d.ts.map