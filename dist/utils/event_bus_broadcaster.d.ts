export declare class EventBusBroadcaster {
    private listeners;
    on(event: string, handler: (payload: any) => void): () => void;
    off(event: string, handler: (payload: any) => void): void;
    emit(event: string, payload: any): void;
}
//# sourceMappingURL=event_bus_broadcaster.d.ts.map