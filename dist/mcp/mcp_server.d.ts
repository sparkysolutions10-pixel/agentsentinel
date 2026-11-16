/**
 * AgentSentinel Unified Native MCP Server
 *
 * Implements the official Model Context Protocol (JSON-RPC 2.0 over stdio & remote SSE)
 * exposing the Complete Autonomous Agent Defense Suite:
 * 1. Runtime Zero-Trust AST Firewall (51+ Invariants for Shell, SQL, FS, and Secrets)
 * 2. Blackbox Flight Recorder (Cryptographic Tamper-Proof Audit Chain)
 * 3. Atomic Rollback Engine (ACID Multi-Step Checkpointing & Undo)
 * 4. SmartProxy Gateway (Dynamic Intent-Based 90% Token Reduction)
 *
 * @license MIT
 * @author Sparky Solutions (Mukesh Biswas)
 */
import { BlackboxFlightRecorder } from './blackbox_flight_recorder.js';
import { AtomicRollbackEngine } from './atomic_rollback_engine.js';
import { SmartProxyGateway } from './smart_proxy_gateway.js';
import { SentinelEngine } from '../index.js';
export interface JSONRPCRequest {
    jsonrpc: '2.0';
    id: string | number;
    method: string;
    params?: Record<string, unknown>;
}
export interface JSONRPCResponse {
    jsonrpc: '2.0';
    id: string | number;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
}
export declare class AgentSentinelMCPServer {
    readonly agentId: string;
    readonly engine: SentinelEngine;
    readonly blackbox: BlackboxFlightRecorder;
    readonly rollback: AtomicRollbackEngine;
    readonly proxy: SmartProxyGateway;
    constructor(agentId?: string);
    /**
     * Dispatches and handles a single JSON-RPC 2.0 MCP request.
     */
    handleRequest(req: JSONRPCRequest): Promise<JSONRPCResponse>;
    /**
     * Exposes tool schemas to the MCP client.
     */
    getToolDefinitions(): ({
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                command: {
                    type: string;
                    description: string;
                };
                cwd: {
                    type: string;
                    description: string;
                };
                query?: undefined;
                content?: undefined;
                path?: undefined;
                operation?: undefined;
                eventType?: undefined;
                payload?: undefined;
                format?: undefined;
                name?: undefined;
                watchFiles?: undefined;
                checkpointId?: undefined;
                prompt?: undefined;
                maxTools?: undefined;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                query: {
                    type: string;
                    description: string;
                };
                command?: undefined;
                cwd?: undefined;
                content?: undefined;
                path?: undefined;
                operation?: undefined;
                eventType?: undefined;
                payload?: undefined;
                format?: undefined;
                name?: undefined;
                watchFiles?: undefined;
                checkpointId?: undefined;
                prompt?: undefined;
                maxTools?: undefined;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                content: {
                    type: string;
                    description: string;
                };
                command?: undefined;
                cwd?: undefined;
                query?: undefined;
                path?: undefined;
                operation?: undefined;
                eventType?: undefined;
                payload?: undefined;
                format?: undefined;
                name?: undefined;
                watchFiles?: undefined;
                checkpointId?: undefined;
                prompt?: undefined;
                maxTools?: undefined;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                path: {
                    type: string;
                    description: string;
                };
                operation: {
                    type: string;
                    enum: string[];
                    default: string;
                };
                command?: undefined;
                cwd?: undefined;
                query?: undefined;
                content?: undefined;
                eventType?: undefined;
                payload?: undefined;
                format?: undefined;
                name?: undefined;
                watchFiles?: undefined;
                checkpointId?: undefined;
                prompt?: undefined;
                maxTools?: undefined;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                eventType: {
                    type: string;
                    enum: string[];
                };
                payload: {
                    type: string;
                    description: string;
                };
                command?: undefined;
                cwd?: undefined;
                query?: undefined;
                content?: undefined;
                path?: undefined;
                operation?: undefined;
                format?: undefined;
                name?: undefined;
                watchFiles?: undefined;
                checkpointId?: undefined;
                prompt?: undefined;
                maxTools?: undefined;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                command?: undefined;
                cwd?: undefined;
                query?: undefined;
                content?: undefined;
                path?: undefined;
                operation?: undefined;
                eventType?: undefined;
                payload?: undefined;
                format?: undefined;
                name?: undefined;
                watchFiles?: undefined;
                checkpointId?: undefined;
                prompt?: undefined;
                maxTools?: undefined;
            };
            required?: undefined;
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                format: {
                    type: string;
                    enum: string[];
                    default: string;
                };
                command?: undefined;
                cwd?: undefined;
                query?: undefined;
                content?: undefined;
                path?: undefined;
                operation?: undefined;
                eventType?: undefined;
                payload?: undefined;
                name?: undefined;
                watchFiles?: undefined;
                checkpointId?: undefined;
                prompt?: undefined;
                maxTools?: undefined;
            };
            required?: undefined;
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                name: {
                    type: string;
                    description: string;
                };
                watchFiles: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
                command?: undefined;
                cwd?: undefined;
                query?: undefined;
                content?: undefined;
                path?: undefined;
                operation?: undefined;
                eventType?: undefined;
                payload?: undefined;
                format?: undefined;
                checkpointId?: undefined;
                prompt?: undefined;
                maxTools?: undefined;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                checkpointId: {
                    type: string;
                };
                command?: undefined;
                cwd?: undefined;
                query?: undefined;
                content?: undefined;
                path?: undefined;
                operation?: undefined;
                eventType?: undefined;
                payload?: undefined;
                format?: undefined;
                name?: undefined;
                watchFiles?: undefined;
                prompt?: undefined;
                maxTools?: undefined;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                prompt: {
                    type: string;
                    description: string;
                };
                maxTools: {
                    type: string;
                    default: number;
                };
                command?: undefined;
                cwd?: undefined;
                query?: undefined;
                content?: undefined;
                path?: undefined;
                operation?: undefined;
                eventType?: undefined;
                payload?: undefined;
                format?: undefined;
                name?: undefined;
                watchFiles?: undefined;
                checkpointId?: undefined;
            };
            required: string[];
        };
    })[];
    /**
     * Internal tool execution engine.
     */
    private executeTool;
    /**
     * Starts reading JSON-RPC messages from process.stdin and writing to process.stdout.
     */
    startStdioServer(): void;
}
//# sourceMappingURL=mcp_server.d.ts.map