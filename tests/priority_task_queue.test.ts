import { describe, it, expect } from 'vitest';
import { PriorityTaskQueue } from '../src/utils/priority_task_queue.js';

describe('PriorityTaskQueue', () => {
  it('executes tasks respecting priority tiers', async () => {
    const queue = new PriorityTaskQueue();
    const order: string[] = [];

    // Pause first task briefly to populate queue
    const p0 = queue.enqueue(async () => {
      await new Promise(r => setTimeout(r, 20));
      order.push('first');
    }, 'LOW');

    const pLow = queue.enqueue(async () => { order.push('low'); }, 'LOW');
    const pCrit = queue.enqueue(async () => { order.push('critical'); }, 'CRITICAL');
    const pHigh = queue.enqueue(async () => { order.push('high'); }, 'HIGH');

    await Promise.all([p0, pLow, pCrit, pHigh]);
    expect(order).toEqual(['first', 'critical', 'high', 'low']);
  });
});
