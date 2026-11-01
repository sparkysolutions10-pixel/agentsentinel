export class ComplianceFrameworkMapper {
  private static readonly MAPPINGS: Record<string, { iso27001: string; soc2: string }> = {
    access_control: { iso27001: 'A.9.1', soc2: 'CC6.1' },
    encryption: { iso27001: 'A.10.1', soc2: 'CC6.6' },
    audit_logging: { iso27001: 'A.12.4', soc2: 'CC7.2' },
    incident_response: { iso27001: 'A.16.1', soc2: 'CC7.3' }
  };

  public static getControls(category: string): { iso27001: string; soc2: string } | null {
    return this.MAPPINGS[category.toLowerCase()] || null;
  }
}
