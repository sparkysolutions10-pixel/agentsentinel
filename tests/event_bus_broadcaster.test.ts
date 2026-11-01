import { describe, it, expect } from 'vitest';
import { EventBusBroadcaster } from '../src/utils/event_bus_broadcaster.js';

describe('EventBusBroadcaster', () => {
  it('broadcasts events to subscribers', () => {
    const bus = new EventBusBroadcaster();
    let received = null;
    bus.on('ALERT', payload => { received = payload; });
    bus.emit('ALERT', { severity: 'critical' });
    expect(received).toEqual({ severity: 'critical' });
  });
});
