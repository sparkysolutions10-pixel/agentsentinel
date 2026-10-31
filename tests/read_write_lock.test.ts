import { describe, it, expect } from 'vitest';
import { ReadWriteLock } from '../src/utils/read_write_lock.js';

describe('ReadWriteLock', () => {
  it('permits multiple readers simultaneously', async () => {
    const rw = new ReadWriteLock();
    let readers = 0;
    let peakReaders = 0;

    const readTask = async () => {
      await rw.withRead(async () => {
        readers++;
        peakReaders = Math.max(peakReaders, readers);
        await new Promise(r => setTimeout(r, 20));
        readers--;
      });
    };

    await Promise.all([readTask(), readTask(), readTask()]);
    expect(peakReaders).toBe(3);
  });

  it('guarantees exclusive writer isolation', async () => {
    const rw = new ReadWriteLock();
    const timeline: string[] = [];

    const writer = rw.withWrite(async () => {
      timeline.push('writer_start');
      await new Promise(r => setTimeout(r, 20));
      timeline.push('writer_end');
    });

    const reader = rw.withRead(async () => {
      timeline.push('reader');
    });

    await Promise.all([writer, reader]);
    expect(timeline).toEqual(['writer_start', 'writer_end', 'reader']);
  });
});
