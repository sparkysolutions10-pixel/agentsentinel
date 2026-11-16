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
import { createDefaultMcpEngine } from './default_engine.js';
export class AgentSentinelMCPServer {
    agentId;
    engine;
    blackbox;
    rollback;
    proxy;
    constructor(agentId = 'agentsentinel-core') {
        this.agentId = agentId;
        this.engine = createDefaultMcpEngine();
        this.blackbox = new BlackboxFlightRecorder(agentId);
        this.rollback = new AtomicRollbackEngine();
        this.proxy = new SmartProxyGateway();
    }
    /**
     * Dispatches and handles a single JSON-RPC 2.0 MCP request.
     */
    async handleRequest(req) {
        const { id, method, params = {} } = req;
        try {
            switch (method) {
                case 'initialize': {
                    return {
                        jsonrpc: '2.0',
                        id,
                        result: {
                            protocolVersion: '2024-11-05',
                            capabilities: {
                                tools: {},
                                logging: {},
                            },
                            serverInfo: {
                                name: 'agentsentinel',
                                version: '0.1.0',
                                description: 'Universal Zero-Trust Runtime AST Firewall, Blackbox Flight Recorder & Atomic Rollback MCP Server',
                            },
                        },
                    };
                }
                case 'tools/list': {
                    return {
                        jsonrpc: '2.0',
                        id,
                        result: {
                            tools: this.getToolDefinitions(),
                        },
                    };
                }
                case 'tools/call': {
                    const name = params.name;
                    const args = (params.arguments || {});
                    const result = await this.executeTool(name, args);
                    return {
                        jsonrpc: '2.0',
                        id,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                                },
                            ],
                        },
                    };
                }
                case 'notifications/initialized':
                case 'ping': {
                    return {
                        jsonrpc: '2.0',
                        id,
                        result: {},
                    };
                }
                default: {
                    return {
                        jsonrpc: '2.0',
                        id,
                        error: {
                            code: -32601,
                            message: `Method not found: ${method}`,
                        },
                    };
                }
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32603,
                    message: errorMessage,
                },
            };
        }
    }
    /**
     * Exposes tool schemas to the MCP client.
     */
    getToolDefinitions() {
        return [
            // 🛡️ Zero-Trust AST Security Firewall Suite
            {
                name: 'sentinel_audit_command',
                description: 'Audit any shell, bash, or terminal command against 51+ zero-trust AST invariants before execution. Intercepts reverse shells, fork bombs, disk wipes (rm -rf /), curl-pipe malware, and privilege escalation.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        command: { type: 'string', description: 'The terminal command string to inspect.' },
                        cwd: { type: 'string', description: 'Current working directory context (optional).' },
                    },
                    required: ['command'],
                },
            },
            {
                name: 'sentinel_audit_sql',
                description: 'Inspect SQL query statements for destructive DDL (DROP TABLE, DROP DATABASE), unconstrained DELETE/UPDATE, system catalog tampering, and stacked queries.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'The SQL query string to inspect.' },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'sentinel_scan_secrets',
                description: 'Scan code diffs, prompts, or text files for leaked API keys (OpenAI, Anthropic, AWS, GitHub), private keys, high-entropy tokens, credit cards, and PII.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        content: { type: 'string', description: 'The content string or code snippet to scan.' },
                    },
                    required: ['content'],
                },
            },
            {
                name: 'sentinel_verify_path',
                description: 'Validate file paths against directory traversal (../), sensitive OS paths (/etc/shadow, ~/.ssh), git CI tampering, and workspace jail confinement.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: { type: 'string', description: 'The target file or directory path.' },
                        operation: { type: 'string', enum: ['read', 'write', 'delete'], default: 'read' },
                    },
                    required: ['path'],
                },
            },
            // ✈️ Cryptographic Blackbox Flight Recorder
            {
                name: 'sentinel_blackbox_record',
                description: 'Record an event (prompt, tool_call, result, policy) to the cryptographic tamper-proof flight recorder.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eventType: {
                            type: 'string',
                            enum: ['prompt', 'tool_call', 'tool_result', 'policy_decision', 'security_alert', 'system_event'],
                        },
                        payload: {
                            type: 'object',
                            description: 'Arbitrary structured event details to cryptographically anchor.',
                        },
                    },
                    required: ['eventType', 'payload'],
                },
            },
            {
                name: 'sentinel_blackbox_verify',
                description: 'Verify the cryptographic SHA-256 Merkle chain integrity of the blackbox flight recorder.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'sentinel_blackbox_export',
                description: 'Export a forensic audit log of the agent flight recorder in JSON or Markdown format.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        format: {
                            type: 'string',
                            enum: ['json', 'markdown'],
                            default: 'json',
                        },
                    },
                },
            },
            // 🔄 ACID Atomic Rollback Engine
            {
                name: 'sentinel_checkpoint_begin',
                description: 'Begin an atomic transactional checkpoint before performing potentially destructive or multi-step operations.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Descriptive checkpoint tag.' },
                        watchFiles: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'List of file paths to snapshot for rollback protection.',
                        },
                    },
                    required: ['name'],
                },
            },
            {
                name: 'sentinel_checkpoint_commit',
                description: 'Permanently commit changes after all actions and tests succeed.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        checkpointId: { type: 'string' },
                    },
                    required: ['checkpointId'],
                },
            },
            {
                name: 'sentinel_checkpoint_rollback',
                description: 'Instantly rollback all files and changes back to the exact checkpoint state if an error or test failure occurs.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        checkpointId: { type: 'string' },
                    },
                    required: ['checkpointId'],
                },
            },
            // ⚡ SmartProxy 90% Token Reduction Gateway
            {
                name: 'sentinel_proxy_route',
                description: 'Dynamically filter and route only the tools relevant to the prompt intent, cutting token costs by up to 90%.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prompt: { type: 'string', description: 'The prompt or task intent to route tools for.' },
                        maxTools: { type: 'number', default: 3 },
                    },
                    required: ['prompt'],
                },
            },
            {
                name: 'sentinel_proxy_metrics',
                description: 'Retrieve live statistics on token savings, query count, and catalog size.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
        ];
    }
    /**
     * Internal tool execution engine.
     */
    async executeTool(name, args) {
        switch (name) {
            // 🛡️ Security Audit Tools
            case 'sentinel_audit_command': {
                const command = String(args.command || '');
                const cwd = args.cwd ? String(args.cwd) : process.cwd();
                const decision = await this.engine.evaluate({
                    id: `cmd_${Date.now()}`,
                    agentId: this.agentId,
                    toolName: 'execute_command',
                    params: { command, cwd },
                    timestamp: Date.now(),
                });
                // Cryptographically record security decision to blackbox
                this.blackbox.recordEvent(decision.verdict === 'ALLOW' ? 'policy_decision' : 'security_alert', {
                    tool: 'sentinel_audit_command',
                    command,
                    verdict: decision.verdict,
                    violations: decision.violations,
                });
                return {
                    verdict: decision.verdict,
                    passed: decision.verdict === 'ALLOW',
                    violationsCount: decision.violations.length,
                    violations: decision.violations,
                    inspectedCommand: command,
                    timestamp: new Date().toISOString(),
                };
            }
            case 'sentinel_audit_sql': {
                const query = String(args.query || '');
                const decision = await this.engine.evaluate({
                    id: `sql_${Date.now()}`,
                    agentId: this.agentId,
                    toolName: 'sql_query',
                    params: { query },
                    timestamp: Date.now(),
                });
                this.blackbox.recordEvent(decision.verdict === 'ALLOW' ? 'policy_decision' : 'security_alert', {
                    tool: 'sentinel_audit_sql',
                    query,
                    verdict: decision.verdict,
                    violations: decision.violations,
                });
                return {
                    verdict: decision.verdict,
                    passed: decision.verdict === 'ALLOW',
                    violationsCount: decision.violations.length,
                    violations: decision.violations,
                    inspectedQuery: query,
                    timestamp: new Date().toISOString(),
                };
            }
            case 'sentinel_scan_secrets': {
                const content = String(args.content || '');
                const decision = await this.engine.evaluate({
                    id: `sec_${Date.now()}`,
                    agentId: this.agentId,
                    toolName: 'write_file',
                    params: { content },
                    timestamp: Date.now(),
                });
                this.blackbox.recordEvent(decision.verdict === 'ALLOW' ? 'policy_decision' : 'security_alert', {
                    tool: 'sentinel_scan_secrets',
                    length: content.length,
                    verdict: decision.verdict,
                    violations: decision.violations,
                });
                return {
                    verdict: decision.verdict,
                    passed: decision.verdict === 'ALLOW',
                    secretsDetected: decision.violations.length > 0,
                    violations: decision.violations,
                    timestamp: new Date().toISOString(),
                };
            }
            case 'sentinel_verify_path': {
                const targetPath = String(args.path || '');
                const operation = String(args.operation || 'read');
                const decision = await this.engine.evaluate({
                    id: `fs_${Date.now()}`,
                    agentId: this.agentId,
                    toolName: operation === 'write' ? 'write_file' : operation === 'delete' ? 'delete_file' : 'read_file',
                    params: { path: targetPath },
                    timestamp: Date.now(),
                });
                this.blackbox.recordEvent(decision.verdict === 'ALLOW' ? 'policy_decision' : 'security_alert', {
                    tool: 'sentinel_verify_path',
                    path: targetPath,
                    operation,
                    verdict: decision.verdict,
                    violations: decision.violations,
                });
                return {
                    verdict: decision.verdict,
                    passed: decision.verdict === 'ALLOW',
                    violationsCount: decision.violations.length,
                    violations: decision.violations,
                    path: targetPath,
                    timestamp: new Date().toISOString(),
                };
            }
            // ✈️ Blackbox Tools
            case 'sentinel_blackbox_record': {
                const eventType = args.eventType;
                const payload = args.payload;
                return this.blackbox.recordEvent(eventType, payload);
            }
            case 'sentinel_blackbox_verify': {
                return this.blackbox.verifyIntegrity();
            }
            case 'sentinel_blackbox_export': {
                const format = args.format || 'json';
                return this.blackbox.exportForensicLog(format);
            }
            // 🔄 Rollback Tools
            case 'sentinel_checkpoint_begin': {
                const chkName = args.name;
                const watchFiles = (args.watchFiles || []);
                const checkpoint = this.rollback.beginCheckpoint(chkName, watchFiles);
                return {
                    checkpointId: checkpoint.id,
                    name: checkpoint.name,
                    createdAt: checkpoint.createdAt,
                    snapshottedFilesCount: checkpoint.snapshots.size,
                };
            }
            case 'sentinel_checkpoint_commit': {
                const chkId = args.checkpointId;
                const success = this.rollback.commit(chkId);
                return { checkpointId: chkId, committed: success };
            }
            case 'sentinel_checkpoint_rollback': {
                const chkId = args.checkpointId;
                return this.rollback.rollback(chkId);
            }
            // ⚡ SmartProxy Tools
            case 'sentinel_proxy_route': {
                const prompt = args.prompt;
                const maxTools = args.maxTools || 3;
                return this.proxy.routeTools(prompt, maxTools);
            }
            case 'sentinel_proxy_metrics': {
                return this.proxy.getMetrics();
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    /**
     * Starts reading JSON-RPC messages from process.stdin and writing to process.stdout.
     */
    startStdioServer() {
        let buffer = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', async (chunk) => {
            buffer += chunk;
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed)
                    continue;
                try {
                    const req = JSON.parse(trimmed);
                    const res = await this.handleRequest(req);
                    process.stdout.write(JSON.stringify(res) + '\n');
                }
                catch (err) {
                    const parseError = {
                        jsonrpc: '2.0',
                        id: null,
                        error: {
                            code: -32700,
                            message: 'Parse error: invalid JSON received',
                        },
                    };
                    process.stdout.write(JSON.stringify(parseError) + '\n');
                }
            }
        });
    }
}
//# sourceMappingURL=mcp_server.js.map