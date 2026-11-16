/**
 * Shell Environment Variable Leak Prevention Guard.
 * Identifies and intercepts attempts to dump, exfiltrate, or harvest the full
 * operating system environment table (which frequently harbors sensitive API keys,
 * database credentials, access tokens, and private SSH secrets).
 *
 * Catches:
 * - Bare `env` / `printenv`
 * - Bare `export` / `export -p`
 * - Bare `set`
 * - `declare -p` / `declare -x`
 * - Reading `/proc/self/environ` or `/proc/<pid>/environ`
 * - Windows `dir env:` or `Get-ChildItem env:` or `[System.Environment]::GetEnvironmentVariables()`
 *
 * Allows:
 * - Targeted whitelisted variables: `printenv PATH`, `printenv NODE_ENV`, `echo $PATH`
 * - Variable assignments: `export NODE_ENV=production`
 * - Scoped commands: `env -i cmd`, `env PATH=$PATH npm test`
 */
import { SentinelRule } from '../types.js';
export type EnvLeakMechanism = 'env' | 'printenv' | 'export_dump' | 'set_dump' | 'proc_environ' | 'powershell_env';
export interface EnvLeakDetectionResult {
    isEnvDump: boolean;
    mechanism?: EnvLeakMechanism;
    targetVariable?: string;
    reason?: string;
    detectedPattern?: string;
}
export interface EnvLeakRuleOptions {
    allowedVariables?: string[];
}
export declare const DEFAULT_ALLOWED_ENV_VARS: string[];
/**
 * Analyzes command line strings for environment variable dump / leakage vectors.
 */
export declare function detectEnvLeak(rawCommand: string, allowedVariables?: string[]): EnvLeakDetectionResult;
/**
 * Creates the standard SentinelRule to strictly block shell environment table dumping.
 */
export declare function createEnvLeakPreventionRule(options?: EnvLeakRuleOptions): SentinelRule;
export declare const envLeakBlockerRule: SentinelRule;
//# sourceMappingURL=envleak.d.ts.map