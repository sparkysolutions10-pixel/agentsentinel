/**
 * MitreAttackMapper - Maps agent security events to MITRE ATT&CK techniques.
 */

export interface MitreTechnique {
  techniqueId: string;
  name: string;
  tactic: string;
  description: string;
}

export class MitreAttackMapper {
  private static readonly TECHNIQUES: Record<string, MitreTechnique> = {
    command_injection: {
      techniqueId: 'T1059',
      name: 'Command and Scripting Interpreter',
      tactic: 'Execution',
      description: 'Adversary executes unauthorized commands via interpreter or shell'
    },
    unauthorized_file_read: {
      techniqueId: 'T1083',
      name: 'File and Directory Discovery',
      tactic: 'Discovery',
      description: 'Adversary enumerates filesystem or accesses unauthorized paths'
    },
    data_exfiltration: {
      techniqueId: 'T1048',
      name: 'Exfiltration Over Alternative Protocol',
      tactic: 'Exfiltration',
      description: 'Adversary exfiltrates stolen data via external network calls'
    },
    defense_evasion: {
      techniqueId: 'T1562',
      name: 'Impair Defenses',
      tactic: 'Defense Evasion',
      description: 'Adversary attempts to disable or evade security guardrails'
    },
    credential_access: {
      techniqueId: 'T1552',
      name: 'Unsecured Credentials',
      tactic: 'Credential Access',
      description: 'Adversary searches for private keys, tokens, or passwords in files'
    }
  };

  public static mapEvent(category: string): MitreTechnique {
    return this.TECHNIQUES[category] ?? {
      techniqueId: 'T1000',
      name: 'Unspecified Technique',
      tactic: 'Initial Access',
      description: 'General unclassified security violation'
    };
  }
}
