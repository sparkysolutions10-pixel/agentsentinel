export class EventBusBroadcaster {
    listeners = new Map();
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(handler);
        return () => this.off(event, handler);
    }
    off(event, handler) {
        this.listeners.get(event)?.delete(handler);
    }
    emit(event, payload) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(h => {
                try {
                    h(payload);
                }
                catch { }
            });
        }
    }
}
//# sourceMappingURL=event_bus_broadcaster.js.map