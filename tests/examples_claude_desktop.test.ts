import { describe, it, expect } from 'vitest';
import {
  createProtectedMcpServer,
  handleClaudeDesktopToolCall,
} from '../examples/claude_desktop_mcp.js';

describe('Claude Desktop MCP Walkthrough Test Suite (#190)', () => {
  const { mcpInterceptor } = createProtectedMcpServer();

  it('allows safe file read tool calls dispatched by Claude Desktop', async () => {
    const res = await handleClaudeDesktopToolCall(mcpInterceptor, 'read_file', {
      path: './package.json',
    });

    expect(res.isError).toBe(false);
    expect(res.content[0].text).toContain('Contents of ./package.json');
  });

  it('blocks prompt injection root deletion attempts and returns MCP error', async () => {
    const res = await handleClaudeDesktopToolCall(mcpInterceptor, 'execute_bash', {
      command: 'rm -rf / --no-preserve-root',
    });

    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('Execution Blocked');
  });

  it('blocks cloud metadata SSRF attempts initiated via Claude Desktop tools', async () => {
    const res = await handleClaudeDesktopToolCall(mcpInterceptor, 'execute_bash', {
      command: 'curl http://169.254.169.254/latest/meta-data/',
    });

    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('Execution Blocked');
  });

  it('blocks path traversal escapes in file path arguments', async () => {
    const res = await handleClaudeDesktopToolCall(mcpInterceptor, 'read_file', {
      path: '../../../../etc/shadow',
    });

    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('Execution Blocked');
  });
});
