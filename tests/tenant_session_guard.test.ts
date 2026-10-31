import { describe, it, expect } from 'vitest';
import { createTenantIsolationRule } from '../src/web3/tenant_session_guard.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('TenantSessionIsolationGuard', () => {
  const rule = createTenantIsolationRule({ currentTenantId: 'tenant_acme_corp' });

  it('allows access to resources belonging to the authenticated tenant', () => {
    const context: ToolCallContext = {
      id: 'tx_tenant_valid',
      toolName: 'read_wallet_keystore',
      params: { tenantId: 'tenant_acme_corp' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks access to peer tenant resources', () => {
    const context: ToolCallContext = {
      id: 'tx_tenant_breach',
      toolName: 'read_wallet_keystore',
      params: { tenantId: 'tenant_competitor_inc' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('CROSS_TENANT_VIOLATION');
  });
});
