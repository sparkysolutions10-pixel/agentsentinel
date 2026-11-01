import { describe, it, expect } from 'vitest';
import { SubdomainExtractor } from '../src/utils/subdomain_extractor.js';

describe('SubdomainExtractor', () => {
  it('extracts root domain and subdomain', () => {
    expect(SubdomainExtractor.extract('horizon.stellar.org')).toEqual({
      subdomain: 'horizon',
      rootDomain: 'stellar.org'
    });
    expect(SubdomainExtractor.extract('stellar.org')).toEqual({
      subdomain: null,
      rootDomain: 'stellar.org'
    });
  });
});
