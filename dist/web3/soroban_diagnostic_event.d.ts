/**
 * AgentSentinel - Soroban Contract Diagnostic Event Parser and Filter
 * Parses diagnostic events emitted during Soroban contract simulation and execution
 * to extract structured error codes, revert reasons, and panic triggers.
 */
import { SentinelRule } from '../types.js';
export interface SorobanDiagnosticConfig {
    blockOnPanic?: boolean;
}
export declare function createSorobanDiagnosticEventParserRule(config?: SorobanDiagnosticConfig): SentinelRule;
//# sourceMappingURL=soroban_diagnostic_event.d.ts.map