/**
 * MitreAttackMapper - Maps agent security events to MITRE ATT&CK techniques.
 */
export interface MitreTechnique {
    techniqueId: string;
    name: string;
    tactic: string;
    description: string;
}
export declare class MitreAttackMapper {
    private static readonly TECHNIQUES;
    static mapEvent(category: string): MitreTechnique;
}
//# sourceMappingURL=mitre_attack_mapper.d.ts.map