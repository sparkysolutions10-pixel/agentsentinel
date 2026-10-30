import { describe, it, expect } from 'vitest';
import {
  NetworkAllowlistGuard,
  createNetworkAllowlistRule,
} from '../src/rules/network_allowlist.js';
import { SentinelEngine } from '../src/index.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Outbound Network Destination Domain & IP Allowlist Rule (#128)', () => {
  it('allows exact domain matches and subdomain wildcards', () => {
    const guard = new NetworkAllowlistGuard({
      allowedDomains: ['api.github.com', '*.internal.company.com', 'cdn.jsdelivr.net'],
    });

    expect(guard.validateDestination('https://api.github.com/repos/sparky').allowed).toBe(true);
    expect(guard.validateDestination('https://auth.internal.company.com/v1').allowed).toBe(true);
    expect(guard.validateDestination('https://internal.company.com/ping').allowed).toBe(true);
    expect(guard.validateDestination('https://cdn.jsdelivr.net/npm/package').allowed).toBe(true);
  });

  it('blocks unapproved domains with critical exfiltration severity', () => {
    const guard = new NetworkAllowlistGuard({
      allowedDomains: ['api.stripe.com', '*.company.corp'],
    });

    const exfilCheck = guard.validateDestination('https://evil-attacker-drop.com/steal?token=123');
    expect(exfilCheck.allowed).toBe(false);
    expect(exfilCheck.isExfiltrationRisk).toBe(true);
    expect(exfilCheck.reason).toContain('Unauthorized destination domain "evil-attacker-drop.com" rejected');
  });

  it('blocks raw IP destinations unless explicitly permitted in allowedIps', () => {
    const guard = new NetworkAllowlistGuard({
      allowedDomains: ['api.example.com'],
      allowedIps: ['10.50.0.1'],
    });

    // Permitted IP passes
    expect(guard.validateDestination('http://10.50.0.1:8080/metrics').allowed).toBe(true);

    // Unapproved public IP is blocked
    const ipCheck = guard.validateDestination('http://198.51.100.42:9999/data');
    expect(ipCheck.allowed).toBe(false);
    expect(ipCheck.reason).toContain('Outbound connection to unapproved IP address');
  });

  it('blocks localhost by default to prevent SSRF unless allowLocalhost is true', () => {
    const defaultGuard = new NetworkAllowlistGuard({
      allowedDomains: ['*'],
    });

    expect(defaultGuard.validateDestination('http://localhost:3000/admin').allowed).toBe(false);
    expect(defaultGuard.validateDestination('http://127.0.0.1:8080/internal').allowed).toBe(false);

    const devGuard = new NetworkAllowlistGuard({
      allowedDomains: ['*'],
      allowLocalhost: true,
    });
    expect(devGuard.validateDestination('http://localhost:3000/admin').allowed).toBe(true);
  });

  it('extracts target URLs nested inside complex tool parameters', () => {
    const guard = new NetworkAllowlistGuard({
      allowedDomains: ['safe.corp'],
    });

    const ctx: ToolCallContext = {
      id: 'net-ctx-1',
      toolName: 'http_client',
      category: 'network',
      params: {
        request: {
          config: {
            url: 'https://exfiltrate-data.xyz/upload',
            method: 'POST',
          },
        },
      },
      timestamp: Date.now(),
    };

    const violation = guard.evaluateContext(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.reason).toContain('exfiltrate-data.xyz');
  });

  it('integrates seamlessly with SentinelEngine via createNetworkAllowlistRule()', async () => {
    const engine = new SentinelEngine();
    engine.registry.register(
      createNetworkAllowlistRule({
        allowedDomains: ['api.openai.com', 'api.anthropic.com'],
      })
    );

    const safeCall = await engine.evaluate({
      id: 'call-1',
      toolName: 'fetch',
      params: { endpoint: 'https://api.openai.com/v1/chat' },
      timestamp: Date.now(),
    });
    expect(safeCall.allowed).toBe(true);

    const badCall = await engine.evaluate({
      id: 'call-2',
      toolName: 'fetch',
      params: { endpoint: 'https://malicious-pastebin.com/leak' },
      timestamp: Date.now(),
    });
    expect(badCall.allowed).toBe(false);
    expect(badCall.verdict).toBe(Verdict.BLOCK);
    expect(badCall.violations[0].ruleId).toBe('network-outbound-domain-allowlist');
  });
});
