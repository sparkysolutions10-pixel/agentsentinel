export type SorobanValCategory = 'Integer' | 'String' | 'Address' | 'Boolean' | 'Void' | 'Unknown';

export class SorobanValTypeClassifier {
  public static classify(val: any): SorobanValCategory {
    if (val === null || val === undefined) return 'Void';
    if (typeof val === 'boolean') return 'Boolean';
    if (typeof val === 'number' || typeof val === 'bigint') return 'Integer';
    if (typeof val === 'string') {
      if (val.startsWith('G') && val.length === 56) return 'Address';
      if (val.startsWith('C') && val.length === 56) return 'Address';
      return 'String';
    }
    return 'Unknown';
  }
}
