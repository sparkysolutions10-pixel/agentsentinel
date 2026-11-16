/**
 * IncidentSeverityMatrix - Severity and SLA prioritization matrix.
 */
export class IncidentSeverityMatrix {
    static evaluate(impact, likelihood) {
        if (impact === 'CRITICAL' || (impact === 'HIGH' && likelihood === 'HIGH')) {
            return { priority: 'P1', slaMinutes: 15, requiresPagerDuty: true };
        }
        if (impact === 'HIGH' || (impact === 'MEDIUM' && likelihood === 'HIGH')) {
            return { priority: 'P2', slaMinutes: 60, requiresPagerDuty: true };
        }
        if (impact === 'MEDIUM' || (impact === 'LOW' && likelihood === 'HIGH')) {
            return { priority: 'P3', slaMinutes: 240, requiresPagerDuty: false };
        }
        return { priority: 'P4', slaMinutes: 1440, requiresPagerDuty: false };
    }
}
//# sourceMappingURL=incident_severity_matrix.js.map