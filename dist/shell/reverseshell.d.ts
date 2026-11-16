/**
 * Reverse Shell & Remote Access Payload Detector.
 * Identifies and intercepts outbound interactive command-and-control (C2) shell connections,
 * including bash /dev/tcp, netcat -e, python/perl socket spawns, socat, and PowerShell TCP shells.
 */
import { SentinelRule } from '../types.js';
export interface ReverseShellDetectionResult {
    isReverseShell: boolean;
    reason?: string;
    detectedPattern?: string;
    targetHost?: string;
    targetPort?: number;
}
/**
 * Analyzes command line strings for interactive outbound reverse shell payloads.
 */
export declare function detectReverseShell(rawCommand: string): ReverseShellDetectionResult;
/**
 * Creates the standard SentinelRule to strictly block outbound reverse shell payloads.
 */
export declare function createReverseShellRule(): SentinelRule;
export declare const reverseShellBlockerRule: SentinelRule;
//# sourceMappingURL=reverseshell.d.ts.map