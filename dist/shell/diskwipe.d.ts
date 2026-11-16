/**
 * Disk Formatting & Raw Block Device Wipe Detector.
 * Prevents catastrophic raw disk writes, filesystem creation, and partition table destruction (mkfs, dd of=/dev/*, fdisk, wipefs).
 */
import { SentinelRule } from '../types.js';
export interface DiskWipeDetectionResult {
    isDiskWipe: boolean;
    reason?: string;
    detectedPattern?: string;
}
/**
 * Checks if a target string points to a raw storage block device or partition.
 */
export declare function isRawBlockDevice(target: string): boolean;
/**
 * Analyzes a raw shell command line for catastrophic disk formatting or block device wipe attempts.
 */
export declare function detectDiskWipe(commandLine: string): DiskWipeDetectionResult;
/**
 * Creates the standard SentinelRule to strictly block disk formatting and block device wipes.
 */
export declare function createDiskWipeRule(): SentinelRule;
//# sourceMappingURL=diskwipe.d.ts.map