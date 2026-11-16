/**
 * Model Context Protocol (MCP) Resource Access Policy Inspector.
 * Inspects and validates MCP resource URIs (e.g. resources/read, resources/subscribe)
 * preventing path traversal, sensitive file access (file://), and SSRF attacks (http://, 169.254.169.254).
 */
import { SentinelRule } from '../types.js';
import { McpJsonRpcRequest } from './interceptor.js';
export interface McpResourcePolicyOptions {
    allowedSchemes?: string[];
    disallowedSchemes?: string[];
    allowedFileRoots?: string[];
    disallowSensitiveSystemPaths?: boolean;
    blockPrivateNetworksAndSsrf?: boolean;
}
export interface ResourceUriValidationResult {
    allowed: boolean;
    reason?: string;
    scheme?: string;
    normalizedPath?: string;
}
export declare class McpResourceInspector {
    private allowedSchemes?;
    private disallowedSchemes;
    private allowedFileRoots;
    private disallowSensitiveSystemPaths;
    private blockPrivateNetworksAndSsrf;
    constructor(options?: McpResourcePolicyOptions);
    /**
     * Normalizes path separators and eliminates basic relative dots.
     */
    private normalizePath;
    /**
     * Validates a single resource URI against configured policy.
     */
    validateUri(rawUri: string): ResourceUriValidationResult;
    /**
     * Inspects an MCP JSON-RPC message (specifically resources/read, resources/subscribe).
     */
    inspectJsonRpc(request: McpJsonRpcRequest): {
        allowed: boolean;
        error?: any;
    };
    /**
     * Creates an AgentSentinel SentinelRule for resource URI validation.
     */
    createSentinelRule(): SentinelRule;
}
//# sourceMappingURL=resource_inspector.d.ts.map