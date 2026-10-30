/**
 * Model Context Protocol (MCP) Resource Access Policy Inspector.
 * Inspects and validates MCP resource URIs (e.g. resources/read, resources/subscribe)
 * preventing path traversal, sensitive file access (file://), and SSRF attacks (http://, 169.254.169.254).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { McpJsonRpcRequest, MCP_ERROR_CODES } from './interceptor.js';

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

const DEFAULT_SENSITIVE_PATH_PATTERNS: RegExp[] = [
  // Unix sensitive files & dirs
  /(?:^|\/)etc\/(?:passwd|shadow|sudoers|master\.passwd|security|ssh|ssl)/i,
  /(?:^|\/)(?:proc|sys)(?:\/|$)/i,
  /(?:^|\/)\.(?:ssh|gnupg|aws|kube|docker|config|netrc|bash_history|zsh_history)(?:\/|$)/i,
  /(?:^|\/)var\/run\/docker\.sock/i,

  // Windows sensitive files & dirs
  /[a-z]:[\/\\]windows[\/\\]system32(?:[\/\\]config[\/\\](?:sam|system|security|software))?/i,
  /[a-z]:[\/\\]users[\/\\][^\/\\]+[\/\\]\.(?:ssh|aws|kube|docker)/i,
  /[a-z]:[\/\\]pagefile\.sys/i,
];

const PRIVATE_NETWORK_PATTERNS: RegExp[] = [
  /^https?:\/\/(?:localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0)(?::\d+)?(?:\/|$)/i,
  /^https?:\/\/169\.254\.169\.254(?::\d+)?(?:\/|$)/i, // AWS / GCP / Azure metadata service
  /^https?:\/\/10\.\d+\.\d+\.\d+(?::\d+)?(?:\/|$)/i, // RFC 1918 Class A
  /^https?:\/\/172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+(?::\d+)?(?:\/|$)/i, // RFC 1918 Class B
  /^https?:\/\/192\.168\.\d+\.\d+(?::\d+)?(?:\/|$)/i, // RFC 1918 Class C
  /^https?:\/\/\[::1\](?::\d+)?(?:\/|$)/i, // IPv6 localhost
];

export class McpResourceInspector {
  private allowedSchemes?: Set<string>;
  private disallowedSchemes: Set<string>;
  private allowedFileRoots: string[];
  private disallowSensitiveSystemPaths: boolean;
  private blockPrivateNetworksAndSsrf: boolean;

  constructor(options: McpResourcePolicyOptions = {}) {
    this.allowedSchemes = options.allowedSchemes ? new Set(options.allowedSchemes.map((s) => s.toLowerCase())) : undefined;
    this.disallowedSchemes = new Set((options.disallowedSchemes ?? ['gopher', 'ftp', 'dict']).map((s) => s.toLowerCase()));
    this.allowedFileRoots = (options.allowedFileRoots ?? []).map((p) => this.normalizePath(p));
    this.disallowSensitiveSystemPaths = options.disallowSensitiveSystemPaths !== false;
    this.blockPrivateNetworksAndSsrf = options.blockPrivateNetworksAndSsrf !== false;
  }

  /**
   * Normalizes path separators and eliminates basic relative dots.
   */
  private normalizePath(p: string): string {
    let normalized = p.replace(/\\/g, '/').toLowerCase();
    if (/^\/[a-z]:/.test(normalized)) {
      normalized = normalized.slice(1);
    }
    return normalized;
  }

  /**
   * Validates a single resource URI against configured policy.
   */
  public validateUri(rawUri: string): ResourceUriValidationResult {
    if (!rawUri || typeof rawUri !== 'string') {
      return { allowed: false, reason: 'Resource URI must be a non-empty string.' };
    }

    const trimmed = rawUri.trim();

    // 1. Detect path traversal sequences (both raw and URL-encoded)
    const decoded = decodeURIComponent(trimmed);
    if (trimmed.includes('..') || decoded.includes('..')) {
      return { allowed: false, reason: `Path traversal sequence ".." detected in resource URI: "${rawUri}"` };
    }

    // 2. Extract Scheme
    const matchScheme = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
    if (!matchScheme) {
      return { allowed: false, reason: `Malformed resource URI without scheme: "${rawUri}"` };
    }

    const scheme = matchScheme[1].toLowerCase();

    // Check disallowed schemes
    if (this.disallowedSchemes.has(scheme)) {
      return { allowed: false, scheme, reason: `Prohibited resource URI scheme "${scheme}": "${rawUri}"` };
    }

    // Check allowed schemes if whitelist configured
    if (this.allowedSchemes && !this.allowedSchemes.has(scheme)) {
      return { allowed: false, scheme, reason: `Scheme "${scheme}" is not in the allowed schemes list.` };
    }

    // 3. SSRF & Cloud Metadata Checks for HTTP / HTTPS
    if (scheme === 'http' || scheme === 'https') {
      if (this.blockPrivateNetworksAndSsrf) {
        for (const pattern of PRIVATE_NETWORK_PATTERNS) {
          if (pattern.test(trimmed) || pattern.test(decoded)) {
            return {
              allowed: false,
              scheme,
              reason: `SSRF or private network access to metadata/internal endpoint blocked: "${rawUri}"`,
            };
          }
        }
      }
    }

    // 4. File Scheme Checks
    if (scheme === 'file') {
      // Strip file://
      let filePath = trimmed.replace(/^file:\/\//i, '');
      if (/^\/[a-z]:/i.test(filePath)) {
        filePath = filePath.slice(1);
      }
      const normalized = this.normalizePath(filePath);

      // Check sensitive system paths
      if (this.disallowSensitiveSystemPaths) {
        for (const pattern of DEFAULT_SENSITIVE_PATH_PATTERNS) {
          if (pattern.test(filePath) || pattern.test(normalized)) {
            return {
              allowed: false,
              scheme,
              normalizedPath: normalized,
              reason: `Access to sensitive operating system resource blocked: "${rawUri}"`,
            };
          }
        }
      }

      // Check allowed roots (jail)
      if (this.allowedFileRoots.length > 0) {
        const inAllowedRoot = this.allowedFileRoots.some(
          (root) => normalized === root || normalized.startsWith(root.endsWith('/') ? root : root + '/')
        );
        if (!inAllowedRoot) {
          return {
            allowed: false,
            scheme,
            normalizedPath: normalized,
            reason: `Resource file path "${filePath}" is outside permitted root directories.`,
          };
        }
      }

      return {
        allowed: true,
        scheme,
        normalizedPath: normalized,
      };
    }

    return { allowed: true, scheme };
  }

  /**
   * Inspects an MCP JSON-RPC message (specifically resources/read, resources/subscribe).
   */
  public inspectJsonRpc(request: McpJsonRpcRequest): { allowed: boolean; error?: any } {
    if (request.method === 'resources/read' || request.method === 'resources/subscribe') {
      const uri = request.params?.uri;
      if (!uri) {
        return {
          allowed: false,
          error: {
            code: MCP_ERROR_CODES.INVALID_PARAMS,
            message: `Missing required "uri" parameter for MCP method "${request.method}".`,
          },
        };
      }

      const validation = this.validateUri(uri);
      if (!validation.allowed) {
        return {
          allowed: false,
          error: {
            code: MCP_ERROR_CODES.POLICY_VIOLATION,
            message: `[AgentSentinel MCP Resource Guard] ${validation.reason}`,
            data: {
              uri,
              scheme: validation.scheme,
            },
          },
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Creates an AgentSentinel SentinelRule for resource URI validation.
   */
  public createSentinelRule(): SentinelRule {
    return {
      id: 'mcp-resource-access-policy',
      name: 'MCP Resource URI Security Inspector',
      category: 'fs',
      priority: 960,
      enabled: true,

      evaluate: (ctx: ToolCallContext): RuleViolation | null => {
        const uri = ctx.params?.uri || ctx.params?.resourceUri;
        if (!uri || typeof uri !== 'string') {
          return null;
        }

        const res = this.validateUri(uri);
        if (!res.allowed) {
          return {
            ruleId: 'mcp-resource-access-policy',
            ruleName: 'MCP Resource URI Security Inspector',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: res.reason || 'Prohibited resource URI.',
          };
        }

        return null;
      },
    };
  }
}
