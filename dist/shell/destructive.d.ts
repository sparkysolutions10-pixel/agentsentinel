/**
 * Zero-Trust Destructive Command Interceptor.
 * Prevents recursive deletion targeting root, home, or critical system paths (rm -rf, shred, rmdir /s).
 */
import { SentinelRule } from '../types.js';
export interface DestructiveDetectionResult {
    isDestructive: boolean;
    reason?: string;
    detectedPattern?: string;
}
/**
 * Analyzes a raw shell command line for catastrophic recursive deletion attempts.
 */
export declare function detectDestructiveDeletion(commandLine: string): DestructiveDetectionResult;
/**
 * Creates the standard SentinelRule to strictly block destructive deletion commands.
 */
export declare function createDestructiveDeletionRule(): SentinelRule;
//# sourceMappingURL=destructive.d.ts.map