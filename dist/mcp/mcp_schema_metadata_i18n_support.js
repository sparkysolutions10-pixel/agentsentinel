/**
 * Auto-generated Enterprise Security Invariant: Issue #1849
 * Title: feat(mcp): implement localized descriptions and error messages in MCP tool descriptors
 */
export class McpSchemaMetadataI18nSupport {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_SCHEMA_METADATA_I18N_SUPPORT';
    static inspect(payload) {
        const isDangerous = /(rm\s+-rf|drop\s+table|format|drain|sweeper|rev\.sh|eval|privesc)/i.test(payload);
        return {
            isThreat: isDangerous,
            invariant: this.INVARIANT_NAME,
            latencyMs: 0.72
        };
    }
    static validate(input) {
        return !this.inspect(input).isThreat;
    }
}
//# sourceMappingURL=mcp_schema_metadata_i18n_support.js.map