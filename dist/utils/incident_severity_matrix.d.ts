/**
 * IncidentSeverityMatrix - Severity and SLA prioritization matrix.
 */
export type ImpactLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type LikelihoodLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';
export interface IncidentEvaluation {
    priority: PriorityLevel;
    slaMinutes: number;
    requiresPagerDuty: boolean;
}
export declare class IncidentSeverityMatrix {
    static evaluate(impact: ImpactLevel, likelihood: LikelihoodLevel): IncidentEvaluation;
}
//# sourceMappingURL=incident_severity_matrix.d.ts.map