export type SorobanAuthMode = 'Address' | 'Contract' | 'None' | 'Unknown';

export class SorobanAuthModeClassifier {
  public static classify(credentials: { type?: string; address?: string } | null | undefined): SorobanAuthMode {
    if (!credentials || !credentials.type) return 'None';
    const t = credentials.type.toLowerCase();
    if (t.includes('address')) return 'Address';
    if (t.includes('contract')) return 'Contract';
    return 'Unknown';
  }
}
