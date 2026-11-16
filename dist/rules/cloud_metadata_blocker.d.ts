/**
 * AgentSentinel Cloud Metadata Service Endpoint Access Blocker.
 * Intercepts and strictly prevents Server-Side Request Forgery (SSRF) attempts
 * targeting AWS (IMDSv1/v2), GCP, Azure, Alibaba Cloud, and Kubernetes metadata services.
 * Defeats decimal, octal, hex, and IPv6 address obfuscations.
 */
import { SentinelRule, ToolCallContext, RuleViolation } from '../types.js';
export interface MetadataDetectionResult {
    isMetadataSSRF: boolean;
    provider?: 'AWS' | 'GCP' | 'Azure' | 'Kubernetes' | 'Alibaba' | 'DigitalOcean' | 'Generic';
    detectedTarget?: string;
    reason?: string;
}
/**
 * Scans a target text string for cloud metadata service endpoints.
 */
export declare function detectCloudMetadataSSRF(input: string): MetadataDetectionResult;
export declare class CloudMetadataBlocker {
    /**
     * Deep scans all parameters, command, arguments, and targets in ToolCallContext.
     */
    evaluateContext(ctx: ToolCallContext): RuleViolation | null;
    createSentinelRule(): SentinelRule;
}
export declare function createCloudMetadataBlockerRule(): SentinelRule;
export declare const cloudMetadataBlockerRule: SentinelRule;
//# sourceMappingURL=cloud_metadata_blocker.d.ts.map