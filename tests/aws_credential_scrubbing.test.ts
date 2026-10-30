import { describe, it, expect } from 'vitest';
import {
  detectAWSKeys,
  scrubAWSKeys,
  createAWSKeyDetectorRule,
  redactAWSKeysInParams,
} from '../src/secrets/aws_key_detector.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('AWS Credential Scrubbing on Headers and Command Flags', () => {
  describe('HTTP Headers Scrubbing', () => {
    it('scrubs AWS Access Key in SigV4 Authorization header', () => {
      const authHeader =
        'Authorization: AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20261030/us-east-1/s3/aws4_request, SignedHeaders=host;x-amz-date, Signature=abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
      const scrubbed = scrubAWSKeys(authHeader, { replacement: '[REDACTED_ACCESS_KEY]' });

      expect(scrubbed.hasMatches).toBe(true);
      expect(scrubbed.scrubbedText).not.toContain('AKIAIOSFODNN7EXAMPLE');
      expect(scrubbed.scrubbedText).toContain('Credential=[REDACTED_ACCESS_KEY]/20261030/us-east-1/s3/aws4_request');
      expect(scrubbed.scrubbedText).toContain('SignedHeaders=host;x-amz-date');
    });

    it('scrubs X-Amz-Security-Token session token header', () => {
      const token = 'AQoDYXdzEJr1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijkl'.padEnd(120, 'Z');
      const header = `X-Amz-Security-Token: ${token}`;
      const scrubbed = scrubAWSKeys(header, { replacement: '[REDACTED_STS_TOKEN]' });

      expect(scrubbed.hasMatches).toBe(true);
      expect(scrubbed.scrubbedText).not.toContain(token);
      expect(scrubbed.scrubbedText).toBe('X-Amz-Security-Token: [REDACTED_STS_TOKEN]');
    });

    it('scrubs multiple AWS headers in an HTTP request payload', () => {
      const headers = [
        'Host: s3.amazonaws.com',
        'Authorization: AWS4-HMAC-SHA256 Credential=ASIAIOSFODNN7EXAMPLE/20261030/us-east-1/s3/aws4_request',
        'X-Amz-Security-Token: AQoDYXdzEJr1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklZZZZZZZZZZ',
      ].join('\r\n');

      const result = scrubAWSKeys(headers);
      expect(result.hasMatches).toBe(true);
      expect(result.scrubbedText).not.toContain('ASIAIOSFODNN7EXAMPLE');
      expect(result.scrubbedText).toContain('ASIA***MPLE');
      expect(result.scrubbedText).toContain('Host: s3.amazonaws.com');
    });
  });

  describe('CLI Command Flags Scrubbing', () => {
    it('scrubs --aws-access-key-id and --aws-secret-access-key in CLI string with space separation', () => {
      const cmd =
        'aws s3 cp file.txt s3://bucket/ --aws-access-key-id AKIAIOSFODNN7EXAMPLE --aws-secret-access-key wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
      const scrubbed = scrubAWSKeys(cmd);

      expect(scrubbed.hasMatches).toBe(true);
      expect(scrubbed.scrubbedText).not.toContain('AKIAIOSFODNN7EXAMPLE');
      expect(scrubbed.scrubbedText).not.toContain('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
      expect(scrubbed.scrubbedText).toContain('--aws-access-key-id AKIA***MPLE');
      expect(scrubbed.scrubbedText).toContain('--aws-secret-access-key aws_sec_***EKEY');
    });

    it('scrubs --aws-secret-access-key with equals sign delimiter', () => {
      const cmd =
        'deploy-script.sh --aws-secret-access-key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY --region=us-west-2';
      const scrubbed = scrubAWSKeys(cmd, { replacement: '***' });

      expect(scrubbed.hasMatches).toBe(true);
      expect(scrubbed.scrubbedText).toBe('deploy-script.sh --aws-secret-access-key=*** --region=us-west-2');
    });

    it('scrubs curl invocation with inline AWS credentials in custom headers', () => {
      const curlCmd =
        'curl -X POST "https://lambda.us-east-1.amazonaws.com" -H "X-Amz-Security-Token: AQoDYXdzEJr1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklZZZZZZZZZZ" -H "X-Amz-Date: 20261030T120000Z"';
      const scrubbed = scrubAWSKeys(curlCmd);

      expect(scrubbed.hasMatches).toBe(true);
      expect(scrubbed.scrubbedText).not.toContain('AQoDYXdzEJr1234567890abcdefghijklmnopqrstuvwxyz');
      expect(scrubbed.scrubbedText).toContain('X-Amz-Security-Token: aws_tok_***');
    });
  });

  describe('AgentSentinel Rule Integration on Command Calls', () => {
    const rule = createAWSKeyDetectorRule({ mode: 'redact' });

    it('redacts command flag parameters in tool execution context', () => {
      const ctx: ToolCallContext = {
        id: 'cmd-call-1',
        toolName: 'execute_command',
        params: {
          command: 'aws ec2 describe-instances --aws-access-key-id AKIAIOSFODNN7EXAMPLE',
          env: {
            AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
          },
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);
      expect(violation?.redactedParams?.command).not.toContain('AKIAIOSFODNN7EXAMPLE');
      expect(violation?.redactedParams?.env.AWS_SECRET_ACCESS_KEY).not.toContain('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
    });

    it('allows clean CLI commands without AWS credentials', () => {
      const ctx: ToolCallContext = {
        id: 'cmd-call-2',
        toolName: 'execute_command',
        params: {
          command: 'aws s3 ls --profile production',
          args: ['--region', 'us-east-1'],
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });
  });
});
