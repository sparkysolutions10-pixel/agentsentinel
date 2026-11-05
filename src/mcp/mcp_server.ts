/**
 * AgentSentinel Unified Native MCP Server
 *
 * Implements the official Model Context Protocol (JSON-RPC 2.0 over stdio)
 * exposing the Trinity of Autonomous Agent Defense:
 * 1. Blackbox Flight Recorder (Cryptographic Tamper-Proof Audit Chain)
 * 2. Atomic Rollback Engine (ACID Multi-Step Checkpointing & Undo)
 * 3. SmartProxy Gateway (Dynamic Intent-Based 90% Token Reduction)
 *
 * @license MIT
 * @author Sparky Solutions (Mukesh Biswas)
 */

import { BlackboxFlightRecorder, type BlackboxEventType } from './blackbox_flight_recorder.js';
import { AtomicRollbackEngine } from './atomic_rollback_engine.js';
import { SmartProxyGateway } from './smart_proxy_gateway.js';

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

export class AgentSentinelMCPServer {
  public readonly blackbox: BlackboxFlightRecorder;
  public readonly rollback: AtomicRollbackEngine;
  public readonly proxy: SmartProxyGateway;

  constructor(agentId: string = 'agentsentinel-core') {
    this.blackbox = new BlackboxFlightRecorder(agentId);
    this.rollback = new AtomicRollbackEngine();
    this.proxy = new SmartProxyGateway();
  }

  /**
   * Dispatches and handles a single JSON-RPC 2.0 MCP request.
   */
  public async handleRequest(req: JSONRPCRequest): Promise<JSONRPCResponse> {
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
                description: 'Universal Zero-Trust Runtime Firewall, Blackbox Flight Recorder & Atomic Rollback MCP Server',
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
          const name = params.name as string;
          const args = (params.arguments || {}) as Record<string, unknown>;
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
    } catch (err: unknown) {
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
  public getToolDefinitions() {
    return [
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
  private async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'sentinel_blackbox_record': {
        const eventType = args.eventType as BlackboxEventType;
        const payload = args.payload as Record<string, unknown>;
        return this.blackbox.recordEvent(eventType, payload);
      }

      case 'sentinel_blackbox_verify': {
        return this.blackbox.verifyIntegrity();
      }

      case 'sentinel_blackbox_export': {
        const format = (args.format as 'json' | 'markdown') || 'json';
        return this.blackbox.exportForensicLog(format);
      }

      case 'sentinel_checkpoint_begin': {
        const chkName = args.name as string;
        const watchFiles = (args.watchFiles || []) as string[];
        const checkpoint = this.rollback.beginCheckpoint(chkName, watchFiles);
        return {
          checkpointId: checkpoint.id,
          name: checkpoint.name,
          createdAt: checkpoint.createdAt,
          snapshottedFilesCount: checkpoint.snapshots.size,
        };
      }

      case 'sentinel_checkpoint_commit': {
        const chkId = args.checkpointId as string;
        const success = this.rollback.commit(chkId);
        return { checkpointId: chkId, committed: success };
      }

      case 'sentinel_checkpoint_rollback': {
        const chkId = args.checkpointId as string;
        return this.rollback.rollback(chkId);
      }

      case 'sentinel_proxy_route': {
        const prompt = args.prompt as string;
        const maxTools = (args.maxTools as number) || 3;
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
  public startStdioServer(): void {
    let buffer = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async (chunk: string) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const req = JSON.parse(trimmed) as JSONRPCRequest;
          const res = await this.handleRequest(req);
          process.stdout.write(JSON.stringify(res) + '\n');
        } catch (err: unknown) {
          const parseError: JSONRPCResponse = {
            jsonrpc: '2.0',
            id: null as unknown as string,
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
