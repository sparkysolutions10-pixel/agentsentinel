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

export class IncidentSeverityMatrix {
  public static evaluate(impact: ImpactLevel, likelihood: LikelihoodLevel): IncidentEvaluation {
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
