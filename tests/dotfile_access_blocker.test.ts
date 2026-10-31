import { describe, it, expect } from 'vitest';
import { DotfileAccessBlocker } from '../src/utils/dotfile_access_blocker.js';

describe('DotfileAccessBlocker', () => {
  it('detects dotfiles and hidden folders in path', () => {
    expect(DotfileAccessBlocker.isDotfileOrDirectory('/home/user/.ssh/id_rsa')).toBe(true);
    expect(DotfileAccessBlocker.isDotfileOrDirectory('project/.git/config')).toBe(true);
    expect(DotfileAccessBlocker.isDotfileOrDirectory('src/index.ts')).toBe(false);
  });

  it('specifically flags critical secret files', () => {
    expect(DotfileAccessBlocker.isCriticalSecretFile('.env')).toBe(true);
    expect(DotfileAccessBlocker.isCriticalSecretFile('.env.production')).toBe(true);
    expect(DotfileAccessBlocker.isCriticalSecretFile('/root/.aws/credentials')).toBe(true);
    expect(DotfileAccessBlocker.isCriticalSecretFile('.eslintrc.json')).toBe(false);
  });
});
