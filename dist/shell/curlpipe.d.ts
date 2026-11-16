/**
 * Curl/Wget Remote Code Execution Shell Pipe Detector.
 * Identifies and intercepts dangerous patterns where remote web payloads
 * are fetched via curl, wget, fetch, or PowerShell and immediately piped
 * or evaluated in an execution shell (curl ... | bash, wget ... | sh, eval $(curl ...)).
 */
import { SentinelRule } from '../types.js';
export interface CurlPipeDetectionResult {
    isCurlPipe: boolean;
    downloader?: 'curl' | 'wget' | 'fetch' | 'httpie' | 'powershell';
    targetShell?: string;
    url?: string;
    reason?: string;
    detectedPattern?: string;
}
/**
 * Analyzes command line strings for dangerous remote script execution patterns.
 */
export declare function detectCurlPipe(rawCommand: string): CurlPipeDetectionResult;
/**
 * Creates the standard SentinelRule to strictly block curl/wget piping to shell.
 */
export declare function createCurlPipeRule(): SentinelRule;
export declare const curlPipeBlockerRule: SentinelRule;
//# sourceMappingURL=curlpipe.d.ts.map