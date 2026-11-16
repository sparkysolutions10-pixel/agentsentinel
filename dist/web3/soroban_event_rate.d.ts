/**
 * AgentSentinel - Anomalous Contract Event Emit Rate Detector
 * Intercepts high-frequency event spam (e.g. hundreds of events emitted in a single transaction)
 * designed to exhaust indexer memory, disrupt RPC nodes, or obfuscate exploit calls.
 */
import { SentinelRule } from '../types.js';
export interface SorobanEventRateConfig {
    maxEventsPerTransaction?: number;
}
export declare function createSorobanEventRateDetectorRule(config?: SorobanEventRateConfig): SentinelRule;
//# sourceMappingURL=soroban_event_rate.d.ts.map