import { describe, it, expect } from 'vitest';
import {
  NetworkAllowlistGuard,
  createNetworkAllowlistRule,
} from '../src/rules/network_allowlist.js';
import { SentinelEngine } from '../src/index.js';
import { createMcpInterceptor } from '../src/mcp/interceptor.js';
import { protectVercelTools, VercelAiCoreTool } from '../src/sdk/vercel_ai_adapter.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Domain Allowlist Rejects Data Exfiltration Destinations (#129)', () => {
  const corporateGuard = new NetworkAllowlistGuard({
    allowedDomains: ['*.internal.company.com', 'api.stripe.com', 'api.github.com'],
  });

  it('rejects public webhook exfiltration services (webhook.site, ngrok, requestbin)', () => {
    const exfilEndpoints = [
      'https://webhook.site/83b5-4a21-9fc8-7821a0',
      'https://tunnel-instance.ngrok-free.app/api/leak',
      'https://postb.in/1628392182-1293',
      'https://c690184.oastify.com/collector',
    ];

    for (const endpoint of exfilEndpoints) {
      const check = corporateGuard.validateDestination(endpoint);
      expect(check.allowed).toBe(false);
      expect(check.isExfiltrationRisk).toBe(true);
      expect(check.reason).toContain('Unauthorized destination domain');
    }
  });

  it('detects and defeats URL userinfo evasion attempts (https://api.github.com@attacker.com)', () => {
    // Evasion attempt: prefixing approved domain before @ userinfo
    const sneakyUrl = 'https://api.github.com:password@exfiltration-hub.ru/dump';
    const check = corporateGuard.validateDestination(sneakyUrl);

    expect(check.allowed).toBe(false);
    expect(check.destination).toBe('exfiltration-hub.ru');
    expect(check.reason).toContain('Unauthorized destination domain "exfiltration-hub.ru"');
  });

  it('inspects alternative protocols like WebSockets (ws://, wss://) and FTP (ftp://)', () => {
    const wsCheck = corporateGuard.validateDestination('wss://unauthorized-stream.org/tunnel');
    expect(wsCheck.allowed).toBe(false);
    expect(wsCheck.destination).toBe('unauthorized-stream.org');

    const ftpCheck = corporateGuard.validateDestination('ftp://ftp.dropzone.net/incoming/db.tar.gz');
    expect(ftpCheck.allowed).toBe(false);
    expect(ftpCheck.destination).toBe('ftp.dropzone.net');
  });

  it('detects unauthorized exfiltration destinations in batch array parameters', () => {
    const ctx: ToolCallContext = {
      id: 'batch-net-1',
      toolName: 'multi_fetch',
      category: 'network',
      params: {
        destinations: [
          'https://api.github.com/repos/sparky',
          'https://api.stripe.com/v1/customers',
          'https://covert-channel.attack.net/drain', // Disallowed!
        ],
      },
      timestamp: Date.now(),
    };

    const violation = corporateGuard.evaluateContext(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.reason).toContain('covert-channel.attack.net');
  });

  it('blocks exfiltration calls through Vercel AI SDK protected tool', async () => {
    const engine = new SentinelEngine();
    engine.registry.register(
      createNetworkAllowlistRule({
        allowedDomains: ['api.internal.org'],
      })
    );

    const tools: Record<string, VercelAiCoreTool> = {
      dispatchWebhook: {
        execute: async ({ targetUrl }) => ({ status: 'sent', targetUrl }),
      },
    };

    const guarded = protectVercelTools(tools, { engine });

    // Allowed internal destination
    const goodCall = await guarded.dispatchWebhook.execute!({ targetUrl: 'https://api.internal.org/sync' });
    expect(goodCall).toEqual({ status: 'sent', targetUrl: 'https://api.internal.org/sync' });

    // Blocked external exfiltration
    await expect(
      guarded.dispatchWebhook.execute!({ targetUrl: 'https://pastebin.com/raw/leaked' })
    ).rejects.toThrow('Unauthorized destination domain "pastebin.com"');
  });

  it('blocks exfiltration calls through MCP JSON-RPC middleware', async () => {
    const engine = new SentinelEngine();
    engine.registry.register(
      createNetworkAllowlistRule({
        allowedDomains: ['safe-partner.com'],
      })
    );

    const interceptor = createMcpInterceptor(engine);

    const result = await interceptor.interceptToolCall('send_payload', {
      endpoint: 'https://evil-exfil-sink.io/collect',
    });

    expect(result.allowed).toBe(false);
    expect(result.verdict).toBe(Verdict.BLOCK);
    expect(result.errorResult?.content[0].text).toContain('evil-exfil-sink.io');
  });
});
