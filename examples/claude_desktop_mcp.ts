/**
 * AgentSentinel - Claude Desktop Model Context Protocol (MCP) Walkthrough Example
 *
 * Demonstrates securing Claude Desktop with an AgentSentinel runtime firewall.
 * Claude Desktop invokes MCP tools via stdio or HTTP JSON-RPC. AgentSentinel
 * intercepts incoming tool calls, verifies security boundaries, and returns structured
 * error responses without crashing Claude Desktop or dropping connection.
 */

import {
  SentinelEngine,
  McpToolCallInterceptor,
  createDestructiveDeletionRule,
  createCloudMetadataBlockerRule,
  createUnconstrainedDeleteRule,
  createPathTraversalGuardRule,
  Verdict,
} from '../src/index.js';

/**
 * 1. Initialize the SentinelEngine with Enterprise Security Rules.
 */
export function createProtectedMcpServer() {
  const engine = new SentinelEngine();

  // Register protection rules
  engine.registerRule(createDestructiveDeletionRule());
  engine.registerRule(createCloudMetadataBlockerRule());
  engine.registerRule(createUnconstrainedDeleteRule());
  engine.registerRule(createPathTraversalGuardRule());

  // Wrap inside the MCP Interceptor
  const mcpInterceptor = new McpToolCallInterceptor({
    engine,
    errorMode: 'tool_result_error', // Standard MCP error response format for Claude Desktop
    agentId: 'claude-desktop-client',
  });

  return { engine, mcpInterceptor };
}

/**
 * 2. Simulate Claude Desktop executing tools through the MCP bridge.
 */
export async function handleClaudeDesktopToolCall(
  interceptor: McpToolCallInterceptor,
  toolName: string,
  args: Record<string, any>
) {
  // Step 1: Firewall Interception
  const interception = await interceptor.interceptToolCall(toolName, args);

  // Step 2: Handle Blocked Violation
  if (!interception.allowed || interception.verdict === Verdict.BLOCK) {
    return {
      isError: true,
      content: interception.errorResult?.content || [
        {
          type: 'text',
          text: `[AgentSentinel] Security Violation: ${interception.violations[0]?.reason}`,
        },
      ],
    };
  }

  // Step 3: Safe Dispatch to Real Tool Primitive
  return executeSafeTool(toolName, interception.sanitizedArgs);
}

/**
 * 3. Dummy backend tool implementations.
 */
function executeSafeTool(name: string, args: Record<string, any>) {
  if (name === 'read_file') {
    return {
      isError: false,
      content: [{ type: 'text', text: `Contents of ${args.path}: Mock file data` }],
    };
  }
  if (name === 'execute_bash') {
    return {
      isError: false,
      content: [{ type: 'text', text: `Command output: Success (${args.command})` }],
    };
  }
  return {
    isError: false,
    content: [{ type: 'text', text: `Executed tool ${name} successfully.` }],
  };
}

// Standalone execution demo
if (process.argv[1]?.endsWith('claude_desktop_mcp.ts') && !process.env.VITEST) {
  const { mcpInterceptor } = createProtectedMcpServer();

  console.log('--- 🛡️ AgentSentinel Claude Desktop MCP Bridge Initialized ---');

  // Case 1: Legitimate safe read request
  console.log('\n[Case 1] Claude Desktop requests file read...');
  handleClaudeDesktopToolCall(mcpInterceptor, 'read_file', { path: './package.json' })
    .then((res) => console.log('Result:', JSON.stringify(res, null, 2)));

  // Case 2: Malicious prompt injection attempt (rm -rf /)
  console.log('\n[Case 2] Prompt injection attempts root wiping...');
  handleClaudeDesktopToolCall(mcpInterceptor, 'execute_bash', { command: 'rm -rf / --no-preserve-root' })
    .then((res) => console.log('Result:', JSON.stringify(res, null, 2)));
}
