/**
 * AgentSentinel Default Security Engine Provider for MCP
 *
 * Instantiates and preconfigures SentinelEngine with the full 51+ invariant suite
 * covering Shell AST, SQL AST, Filesystem Jail, and Secret/PII Scrubbing.
 *
 * @license MIT
 * @author Sparky Solutions (Mukesh Biswas)
 */
import { SentinelEngine } from '../index.js';
export declare function createDefaultMcpEngine(): SentinelEngine;
//# sourceMappingURL=default_engine.d.ts.map