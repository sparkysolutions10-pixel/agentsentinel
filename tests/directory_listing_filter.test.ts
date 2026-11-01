import { describe, it, expect } from 'vitest';
import { DirectoryListingFilter } from '../src/utils/directory_listing_filter.js';

describe('DirectoryListingFilter', () => {
  it('filters out dotfiles and hidden entries', () => {
    const list = ['src', '.git', 'package.json', '.env'];
    expect(DirectoryListingFilter.filterHidden(list)).toEqual(['src', 'package.json']);
  });
});
