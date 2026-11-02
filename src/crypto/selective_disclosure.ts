export interface CredentialClaim {
  key: string;
  value: string;
  blinded: boolean;
}

export class SelectiveDisclosureCredentials {
  public static discloseClaims(claims: CredentialClaim[], allowedKeys: string[]): Record<string, string> {
    const revealed: Record<string, string> = {};
    for (const c of claims) {
      if (allowedKeys.includes(c.key)) {
        revealed[c.key] = c.value;
      } else {
        revealed[c.key] = '[REDACTED_IDENTITY]';
      }
    }
    return revealed;
  }
}
