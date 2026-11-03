import { describe, it, expect } from 'vitest';
import { McpSchemaMetadataI18nSupport } from '../src/mcp/mcp_schema_metadata_i18n_support.js';

describe('McpSchemaMetadataI18nSupport Invariant Suite (#1849)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpSchemaMetadataI18nSupport.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_SCHEMA_METADATA_I18N_SUPPORT');
    expect(McpSchemaMetadataI18nSupport.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpSchemaMetadataI18nSupport.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpSchemaMetadataI18nSupport.validate('git status && npm run test')).toBe(true);
  });
});
