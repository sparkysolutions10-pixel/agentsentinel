import { SentinelEngine } from '../index.js';
export declare const VERSION = "0.1.0";
/**
 * Creates and initializes a SentinelEngine with comprehensive default security rulesets.
 */
export declare function createDefaultCliEngine(policyFile?: string): SentinelEngine;
/**
 * Core CLI execution router.
 */
export declare function runCli(argv: string[], out?: (msg: string) => void, err?: (msg: string) => void): Promise<number>;
//# sourceMappingURL=runner.d.ts.map