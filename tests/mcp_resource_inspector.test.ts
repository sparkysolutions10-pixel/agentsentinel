import { describe, it, expect } from 'vitest';
import {
  McpResourceInspector,
} from '../src/mcp/resource_inspector.js';
import { MCP_ERROR_CODES } from '../src/mcp/interceptor.js';
import { SentinelEngine } from '../src/index.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('MCP Resource Access Policy Inspector (#109)', () => {
  it('validates allowed resource URIs', () => {
    const inspector = new McpResourceInspector();

    const validUris = [
      'https://api.example.com/data/schema.json',
      'file:///var/app/public/index.html',
      'postgres://user:pass@db.example.com:5432/analytics',
      'custom-plugin://docs/getting-started',
    ];

    for (const uri of validUris) {
      const res = inspector.validateUri(uri);
      expect(res.allowed).toBe(true);
    }
  });

  it('blocks path traversal attacks in resource URIs', () => {
    const inspector = new McpResourceInspector();

    const traversalUris = [
      'file:///var/www/../../etc/passwd',
      'file:///app/config/..%2f..%2fetc/shadow',
      'file:///c:/workspace/..\\..\\windows\\system32',
    ];

    for (const uri of traversalUris) {
      const res = inspector.validateUri(uri);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Path traversal');
    }
  });

  it('blocks access to sensitive operating system files', () => {
    const inspector = new McpResourceInspector();

    const sensitiveFiles = [
      'file:///etc/passwd',
      'file:///etc/shadow',
      'file:///etc/sudoers',
      'file:///home/alice/.ssh/id_rsa',
      'file:///root/.aws/credentials',
      'file:///c:/windows/system32/config/sam',
      'file:///c:/users/admin/.ssh/id_ed25519',
    ];

    for (const uri of sensitiveFiles) {
      const res = inspector.validateUri(uri);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('sensitive operating system resource');
    }
  });

  it('restricts file access to permitted root directories when configured', () => {
    const inspector = new McpResourceInspector({
      allowedFileRoots: ['/var/app/data', 'd:/projects/myrepo/docs'],
    });

    // Allowed within jail
    expect(inspector.validateUri('file:///var/app/data/catalog.json').allowed).toBe(true);
    expect(inspector.validateUri('file:///d:/projects/myrepo/docs/readme.md').allowed).toBe(true);

    // Disallowed outside jail
    const outsideRes = inspector.validateUri('file:///var/log/nginx/access.log');
    expect(outsideRes.allowed).toBe(false);
    expect(outsideRes.reason).toContain('outside permitted root directories');
  });

  it('blocks cloud metadata SSRF and private IP endpoints', () => {
    const inspector = new McpResourceInspector();

    const ssrfUris = [
      'http://169.254.169.254/latest/meta-data/',
      'http://localhost:9000/metrics',
      'http://127.0.0.1:3000/api',
      'http://10.0.0.5/internal/secrets',
      'http://192.168.1.100/router',
    ];

    for (const uri of ssrfUris) {
      const res = inspector.validateUri(uri);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('SSRF or private network access');
    }
  });

  it('inspects JSON-RPC resources/read requests correctly', () => {
    const inspector = new McpResourceInspector();

    // 1. Missing uri
    const badReq = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'resources/read',
      params: {},
    };
    const badRes = inspector.inspectJsonRpc(badReq);
    expect(badRes.allowed).toBe(false);
    expect(badRes.error?.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS);

    // 2. Sensitive uri
    const sensitiveReq = {
      jsonrpc: '2.0' as const,
      id: 2,
      method: 'resources/read',
      params: { uri: 'file:///etc/shadow' },
    };
    const sensitiveRes = inspector.inspectJsonRpc(sensitiveReq);
    expect(sensitiveRes.allowed).toBe(false);
    expect(sensitiveRes.error?.code).toBe(MCP_ERROR_CODES.POLICY_VIOLATION);
    expect(sensitiveRes.error?.message).toContain('sensitive operating system resource');

    // 3. Valid uri
    const validReq = {
      jsonrpc: '2.0' as const,
      id: 3,
      method: 'resources/read',
      params: { uri: 'https://api.github.com/repos/sparky' },
    };
    const validRes = inspector.inspectJsonRpc(validReq);
    expect(validRes.allowed).toBe(true);
  });

  it('integrates seamlessly with SentinelEngine via createSentinelRule()', async () => {
    const inspector = new McpResourceInspector();
    const rule = inspector.createSentinelRule();

    const engine = new SentinelEngine();
    engine.registry.register(rule);

    const safeCtx: ToolCallContext = {
      toolName: 'read_resource',
      params: { uri: 'https://cdn.example.com/avatar.png' },
    };
    const safeEval = await engine.evaluate(safeCtx);
    expect(safeEval.allowed).toBe(true);
    expect(safeEval.verdict).toBe(Verdict.ALLOW);

    const dirtyCtx: ToolCallContext = {
      toolName: 'read_resource',
      params: { uri: 'file:///etc/passwd' },
    };
    const dirtyEval = await engine.evaluate(dirtyCtx);
    expect(dirtyEval.allowed).toBe(false);
    expect(dirtyEval.verdict).toBe(Verdict.BLOCK);
    expect(dirtyEval.violations[0].ruleId).toBe('mcp-resource-access-policy');
  });
});
