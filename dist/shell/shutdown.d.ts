/**
 * System Shutdown, Reboot, and Halt Command Blocker.
 * Identifies and intercepts destructive operating system level power manipulation
 * commands that trigger machine shutdown, restart, poweroff, or runlevel halt
 * across Linux, macOS, and Windows environments.
 */
import { SentinelRule } from '../types.js';
export type ShutdownAction = 'shutdown' | 'reboot' | 'halt' | 'poweroff';
export type OSPlatform = 'linux' | 'windows' | 'macos' | 'universal';
export interface ShutdownDetectionResult {
    isShutdown: boolean;
    action?: ShutdownAction;
    platform?: OSPlatform;
    reason?: string;
    detectedPattern?: string;
}
/**
 * Analyzes command line strings for shutdown, reboot, and power state manipulation.
 */
export declare function detectShutdownCommand(rawCommand: string): ShutdownDetectionResult;
/**
 * Creates the standard SentinelRule to strictly block system shutdown and reboot commands.
 */
export declare function createShutdownBlockerRule(): SentinelRule;
export declare const shutdownBlockerRule: SentinelRule;
//# sourceMappingURL=shutdown.d.ts.map