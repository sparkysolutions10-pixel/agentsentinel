import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createCloudMetadataBlockerRule } from '../src/rules/cloud_metadata_blocker.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Cloud Metadata SSRF Attempts Test Suite (#131)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createCloudMetadataBlockerRule());

  it('blocks AWS IMDSv2 token extraction and subsequent metadata queries', async () => {
    const imdsv2TokenCtx: ToolCallContext = {
      id: 'test_token_1',
      toolName: 'bash',
      params: {
        command: 'curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"',
        args: ['-c', 'curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"'],
      },
      timestamp: Date.now(),
    };
    const res = await engine.evaluate(imdsv2TokenCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].ruleId).toBe('network-block-cloud-metadata-ssrf');
  });

  it('blocks IPv6 mapped IPv4 and native IPv6 metadata endpoints', async () => {
    const ipv6Targets = [
      'curl http://[fd00:ec2::254]/latest/meta-data/',
      'wget http://[::ffff:169.254.169.254]/latest/meta-data/',
      'fetch("http://[fd00:ec2::254]/")',
    ];

    for (const cmd of ipv6Targets) {
      const ctx: ToolCallContext = {
        id: 'test_ipv6',
        toolName: 'bash',
        params: { command: cmd },
        timestamp: Date.now(),
      };
      const res = await engine.evaluate(ctx);
      expect(res.allowed).toBe(false);
      expect(res.verdict).toBe(Verdict.BLOCK);
    }
  });

  it('blocks decimal integer and dword IP encoded SSRF evasions', async () => {
    // 2852039166 is decimal representation of 169.254.169.254
    const dwordTargets = [
      'curl http://2852039166/latest/meta-data/iam/security-credentials/',
      'python -c "import urllib.request; urllib.request.urlopen(\'http://2852039166/\')"',
    ];

    for (const cmd of dwordTargets) {
      const ctx: ToolCallContext = {
        id: 'test_dword',
        toolName: 'bash',
        params: { command: cmd },
        timestamp: Date.now(),
      };
      const res = await engine.evaluate(ctx);
      expect(res.allowed).toBe(false);
      expect(res.verdict).toBe(Verdict.BLOCK);
    }
  });

  it('blocks octal and hexadecimal IP obfuscations', async () => {
    const obfuscatedTargets = [
      'curl http://0xa9fea9fe/latest/meta-data/',
      'curl http://0xa9.0xfe.0xa9.0xfe/latest/meta-data/',
      'curl http://0251.0376.0251.0376/latest/meta-data/',
    ];

    for (const cmd of obfuscatedTargets) {
      const ctx: ToolCallContext = {
        id: 'test_hex_octal',
        toolName: 'bash',
        params: { command: cmd },
        timestamp: Date.now(),
      };
      const res = await engine.evaluate(ctx);
      expect(res.allowed).toBe(false);
      expect(res.verdict).toBe(Verdict.BLOCK);
    }
  });

  it('blocks GCP, Azure, and Alibaba metadata hostname targets', async () => {
    const cloudTargets = [
      'curl "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token" -H "Metadata-Flavor: Google"',
      'curl -H "Metadata:true" "http://169.254.169.254/metadata/instance?api-version=2021-02-01"',
      'curl http://100.100.100.200/latest/meta-data/',
      'curl http://instance-data/latest/meta-data/',
    ];

    for (const cmd of cloudTargets) {
      const ctx: ToolCallContext = {
        id: 'test_cloud_hosts',
        toolName: 'bash',
        params: { command: cmd },
        timestamp: Date.now(),
      };
      const res = await engine.evaluate(ctx);
      expect(res.allowed).toBe(false);
      expect(res.verdict).toBe(Verdict.BLOCK);
    }
  });

  it('blocks Kubernetes API server service account token theft via tool parameters', async () => {
    const k8sToolCall: ToolCallContext = {
      id: 'test_k8s',
      toolName: 'http_request',
      params: {
        method: 'GET',
        url: 'https://kubernetes.default.svc/api/v1/namespaces/default/secrets',
        headers: {
          Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9...',
        },
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(k8sToolCall);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
  });

  it('blocks uppercase and mixed-case URL schemes and hostnames', async () => {
    const mixedCaseUrls = [
      'curl HTTP://169.254.169.254/LATEST/META-DATA/',
      'curl HTTP://METADATA.GOOGLE.INTERNAL/COMPUTEMETADATA/V1/',
    ];

    for (const cmd of mixedCaseUrls) {
      const ctx: ToolCallContext = {
        id: 'test_case',
        toolName: 'bash',
        params: { command: cmd },
        timestamp: Date.now(),
      };
      const res = await engine.evaluate(ctx);
      expect(res.allowed).toBe(false);
      expect(res.verdict).toBe(Verdict.BLOCK);
    }
  });

  it('allows safe legitimate outbound public and private requests', async () => {
    const safeRequests: ToolCallContext[] = [
      { id: 'safe_1', toolName: 'http_client', params: { url: 'https://api.github.com/repos/sparkysolutions10-pixel/agentsentinel' }, timestamp: Date.now() },
      { id: 'safe_2', toolName: 'http_client', params: { url: 'https://api.anthropic.com/v1/messages' }, timestamp: Date.now() },
      { id: 'safe_3', toolName: 'http_client', params: { url: 'https://api.openai.com/v1/chat/completions' }, timestamp: Date.now() },
      { id: 'safe_4', toolName: 'bash', params: { command: 'curl -fsSL https://registry.npmjs.org/agentsentinel' }, timestamp: Date.now() },
      { id: 'safe_5', toolName: 'bash', params: { command: 'curl http://192.168.1.100:8080/health' }, timestamp: Date.now() },
    ];

    for (const req of safeRequests) {
      const res = await engine.evaluate(req);
      expect(res.allowed).toBe(true);
      expect(res.verdict).toBe(Verdict.ALLOW);
    }
  });
});
