/**
 * Fork Bomb & Resource Exhaustion Signature Detector.
 * Prevents system freezing via exponential process tree fork bombs and infinite background subshell spawning.
 */
import { SentinelRule } from '../types.js';
export interface ForkBombDetectionResult {
    isForkBomb: boolean;
    reason?: string;
    detectedPattern?: string;
}
/**
 * Analyzes a command line string for process exhaustion and fork bomb patterns.
 */
export declare function detectForkBomb(rawCommand: string): ForkBombDetectionResult;
/**
 * Creates the standard SentinelRule to strictly block fork bombs and denial-of-service process exhaustion.
 */
export declare function createForkBombRule(): SentinelRule;
export declare const forkBombBlockerRule: SentinelRule;
//# sourceMappingURL=forkbomb.d.ts.map