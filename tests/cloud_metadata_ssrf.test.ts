import { describe, it, expect } from 'vitest';
import {
  detectCloudMetadataSSRF,
  createCloudMetadataBlockerRule,
} from '../src/rules/cloud_metadata_blocker.js';
import { SentinelEngine } from '../src/index.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Cloud Metadata Service Endpoint Access Blocker (#130 & #131)', () => {
  it('detects AWS IMDSv1/v2 endpoint across standard and credential paths', () => {
    const urls = [
      'http://169.254.169.254/latest/meta-data/',
      'http://169.254.169.254/latest/meta-data/iam/security-credentials/admin-role',
      'http://169.254.169.254:80/latest/api/token',
      'http://instance-data/latest/meta-data/',
      'http://[fd00:ec2::254]/latest/meta-data/',
    ];

    for (const url of urls) {
      const res = detectCloudMetadataSSRF(url);
      expect(res.isMetadataSSRF).toBe(true);
      expect(res.provider).toBe('AWS');
      expect(res.reason).toContain('Prohibited cloud metadata service access detected');
    }
  });

  it('detects Google Cloud Platform (GCP) Compute Engine metadata service', () => {
    const gcpEndpoints = [
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
      'http://metadata.goog/computeMetadata/v1/',
    ];

    for (const ep of gcpEndpoints) {
      const res = detectCloudMetadataSSRF(ep);
      expect(res.isMetadataSSRF).toBe(true);
      expect(res.provider).toBe('GCP');
    }
  });

  it('detects Azure WireServer and Alibaba Cloud ECS metadata services', () => {
    // Azure
    const azureRes = detectCloudMetadataSSRF('http://168.63.129.16/metadata/instance?api-version=2021-02-01');
    expect(azureRes.isMetadataSSRF).toBe(true);
    expect(azureRes.provider).toBe('Azure');

    // Alibaba
    const aliRes = detectCloudMetadataSSRF('http://100.100.100.200/latest/meta-data/');
    expect(aliRes.isMetadataSSRF).toBe(true);
    expect(aliRes.provider).toBe('Alibaba');
  });

  it('detects Kubernetes in-cluster API service targeting', () => {
    const k8sEndpoints = [
      'https://kubernetes.default.svc',
      'https://kubernetes.default.svc.cluster.local/api/v1/secrets',
    ];

    for (const ep of k8sEndpoints) {
      const res = detectCloudMetadataSSRF(ep);
      expect(res.isMetadataSSRF).toBe(true);
      expect(res.provider).toBe('Kubernetes');
    }
  });

  it('defeats decimal, hex, octal, and IPv6 address obfuscation evasions', () => {
    const obfuscations = [
      'http://2852039166/latest/meta-data', // Decimal
      'http://0xa9fea9fe/latest/meta-data', // Hex
      'http://0251.0376.0251.0376/latest/meta-data', // Octal
      'http://[::ffff:169.254.169.254]/latest/meta-data', // IPv4-mapped IPv6
    ];

    for (const obf of obfuscations) {
      const res = detectCloudMetadataSSRF(obf);
      expect(res.isMetadataSSRF).toBe(true);
      expect(res.reason).toContain('SSRF credential theft');
    }
  });

  it('deep scans bash command strings for curl or wget metadata attacks', async () => {
    const engine = new SentinelEngine();
    engine.registry.register(createCloudMetadataBlockerRule());

    const attackCtx: ToolCallContext = {
      id: 'bash-ssrf-1',
      toolName: 'bash_exec',
      category: 'shell',
      params: {
        command: 'curl -s -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" http://169.254.169.254/latest/api/token',
      },
      timestamp: Date.now(),
    };

    const evalResult = await engine.evaluate(attackCtx);
    expect(evalResult.allowed).toBe(false);
    expect(evalResult.verdict).toBe(Verdict.BLOCK);
    expect(evalResult.violations[0].ruleId).toBe('network-block-cloud-metadata-ssrf');
    expect(evalResult.violations[0].severity).toBe('critical');
  });

  it('allows safe external and corporate API endpoints', () => {
    const safeEndpoints = [
      'https://api.github.com/repos',
      'https://api.stripe.com/v1/charges',
      'https://google.com/search',
      'http://internal-corp-service.company.local/api',
    ];

    for (const ep of safeEndpoints) {
      expect(detectCloudMetadataSSRF(ep).isMetadataSSRF).toBe(false);
    }
  });
});
