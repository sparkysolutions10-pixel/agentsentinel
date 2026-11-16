/**
 * Crontab and Scheduled Task Manipulation Detector.
 * Identifies and intercepts unauthorized modifications to persistence mechanisms,
 * including crontab writes (-e, -r, stdin writes), cron spool directory tampering,
 * Windows schtasks creation/deletion, PowerShell Register-ScheduledTask, and systemd timers.
 * Allows safe read-only queries (crontab -l, schtasks /query, systemctl list-timers).
 */
import { SentinelRule } from '../types.js';
export type PersistenceMechanism = 'crontab' | 'cron_spool' | 'schtasks' | 'systemd_timer' | 'at';
export type PersistenceAction = 'create' | 'edit' | 'delete' | 'overwrite';
export interface CronPersistenceResult {
    isPersistenceModification: boolean;
    mechanism?: PersistenceMechanism;
    action?: PersistenceAction;
    target?: string;
    reason?: string;
    detectedPattern?: string;
}
/**
 * Analyzes command line strings for scheduled task persistence alterations.
 */
export declare function detectCronPersistence(rawCommand: string): CronPersistenceResult;
/**
 * Creates the standard SentinelRule to block unauthorized scheduled persistence modifications.
 */
export declare function createCronPersistenceRule(): SentinelRule;
export declare const cronPersistenceBlockerRule: SentinelRule;
//# sourceMappingURL=cron.d.ts.map