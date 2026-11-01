export class EventBusBroadcaster {
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();

  public on(event: string, handler: (payload: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  public off(event: string, handler: (payload: any) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  public emit(event: string, payload: any): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(h => {
        try {
          h(payload);
        } catch {}
      });
    }
  }
}
