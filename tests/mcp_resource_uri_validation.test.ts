import { describe, it, expect } from 'vitest';
import { McpResourceInspector } from '../src/mcp/resource_inspector.js';
import { createMcpInterceptor } from '../src/mcp/interceptor.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('MCP Resource URI Validation against Forbidden file:// Schemes (#110)', () => {
  it('strictly blocks all file:// schemes when file is in disallowedSchemes', () => {
    const inspector = new McpResourceInspector({
      disallowedSchemes: ['file', 'ftp'],
    });

    const fileUris = [
      'file:///home/user/document.txt',
      'FILE:///var/log/app.log',
      'file:/opt/data/test.json',
      'file:////var/data',
      'file://localhost/etc/hosts',
    ];

    for (const uri of fileUris) {
      const res = inspector.validateUri(uri);
      expect(res.allowed).toBe(false);
      expect(res.scheme).toBe('file');
      expect(res.reason).toContain('Prohibited resource URI scheme "file"');
    }

    // Allowed scheme passes
    expect(inspector.validateUri('https://api.example.com/data').allowed).toBe(true);
  });

  it('detects and blocks null-byte evasion attacks in file URIs', () => {
    const inspector = new McpResourceInspector();

    const nullByteUris = [
      'file:///safe/path\0/etc/passwd',
      'file:///safe/dir%00/etc/shadow',
    ];

    for (const uri of nullByteUris) {
      const res = inspector.validateUri(uri);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Null byte injection');
    }
  });

  it('detects and blocks file://localhost/ host-specified sensitive URIs', () => {
    const inspector = new McpResourceInspector();

    const res = inspector.validateUri('file://localhost/etc/shadow');
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('sensitive operating system resource');
  });

  it('detects and blocks Windows pipe drive notation (c|) pointing to sensitive files', () => {
    const inspector = new McpResourceInspector();

    const res = inspector.validateUri('file:///c|/windows/system32/config/sam');
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('sensitive operating system resource');
  });

  it('blocks multi-slash file URI variations targeting sensitive paths', () => {
    const inspector = new McpResourceInspector();

    const multiSlashUris = [
      'file:////etc/sudoers',
      'file:/etc/passwd',
      'file://///etc/shadow',
    ];

    for (const uri of multiSlashUris) {
      const res = inspector.validateUri(uri);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('sensitive operating system resource');
    }
  });

  it('integrates with McpToolCallInterceptor to block prohibited file:// tool arguments', async () => {
    const engine = new SentinelEngine();
    const inspector = new McpResourceInspector({
      disallowedSchemes: ['file'],
    });

    engine.registry.register(inspector.createSentinelRule());
    const interceptor = createMcpInterceptor(engine);

    // Call tool with forbidden file:// URI
    const decision = await interceptor.interceptToolCall('read_doc', {
      resourceUri: 'file:///etc/hosts',
    });

    expect(decision.allowed).toBe(false);
    expect(decision.verdict).toBe(Verdict.BLOCK);
    expect(decision.errorResult?.isError).toBe(true);
    expect(decision.errorResult?.content[0].text).toContain('Prohibited resource URI scheme "file"');
  });
});
