/**
 * SarifReportFormatter - OASIS SARIF v2.1.0 output generator for security scan findings.
 */

export interface SarifViolationInput {
  ruleId: string;
  ruleName: string;
  message: string;
  level: 'error' | 'warning' | 'note';
  uri?: string;
  startLine?: number;
}

export class SarifReportFormatter {
  public static format(violations: SarifViolationInput[], toolName: string = 'AgentSentinel', toolVersion: string = '1.0.0'): object {
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
