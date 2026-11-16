/**
 * SarifReportFormatter - OASIS SARIF v2.1.0 output generator for security scan findings.
 */
export class SarifReportFormatter {
    static format(violations, toolName = 'AgentSentinel', toolVersion = '1.0.0') {
        return {
            $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
            version: '2.1.0',
            runs: [
                {
                    tool: {
                        driver: {
                            name: toolName,
                            version: toolVersion,
                            rules: violations.map(v => ({
                                id: v.ruleId,
                                name: v.ruleName,
                                shortDescription: { text: v.message }
                            }))
                        }
                    },
                    results: violations.map(v => ({
                        ruleId: v.ruleId,
                        level: v.level,
                        message: { text: v.message },
                        locations: [
                            {
                                physicalLocation: {
                                    artifactLocation: {
                                        uri: v.uri ?? 'unknown'
                                    },
                                    region: {
                                        startLine: v.startLine ?? 1
                                    }
                                }
                            }
                        ]
                    }))
                }
            ]
        };
    }
}
//# sourceMappingURL=sarif_report_formatter.js.map