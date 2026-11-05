import { describe, it, expect, beforeEach } from 'vitest';
import { SmartProxyGateway, MCPToolDefinition } from '../src/mcp/smart_proxy_gateway.js';

describe('SmartProxyGateway', () => {
  let gateway: SmartProxyGateway;

  beforeEach(() => {
    gateway = new SmartProxyGateway();
  });

  it('should return empty matches for an empty catalog', () => {
    const result = gateway.routeTools('hello world');
    expect(result.matchedTools).toHaveLength(0);
    expect(result.totalCatalogSize).toBe(0);
    expect(result.savingsPercentage).toBe(0);
  });

  it('should route relevant tools matching intent and calculate token savings', () => {
    const mockTools: MCPToolDefinition[] = [
      {
        name: 'read_file',
        description: 'Read contents of a file on local filesystem',
        serverName: 'filesystem',
        category: 'fs',
        keywords: ['read', 'file', 'content', 'cat', 'open'],
        inputSchema: { type: 'object', properties: { path: { type: 'string' } } },
      },
      {
        name: 'write_file',
        description: 'Write contents to a file on local filesystem',
        serverName: 'filesystem',
        category: 'fs',
        keywords: ['write', 'save', 'file', 'create'],
        inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } } },
      },
      {
        name: 'execute_sql',
        description: 'Execute a SQL query against PostgreSQL or MySQL database',
        serverName: 'database',
        category: 'sql',
        keywords: ['sql', 'query', 'select', 'database', 'postgres'],
        inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
      },
      {
        name: 'transfer_xlm',
        description: 'Send native XLM payment on Stellar testnet or public network',
        serverName: 'stellar',
        category: 'web3',
        keywords: ['stellar', 'xlm', 'payment', 'transfer', 'crypto', 'wallet'],
        inputSchema: { type: 'object', properties: { destination: { type: 'string' }, amount: { type: 'string' } } },
      },
      {
        name: 'check_stellar_balance',
        description: 'Check XLM and asset balance for a Stellar public key',
        serverName: 'stellar',
        category: 'web3',
        keywords: ['stellar', 'balance', 'account', 'xlm'],
        inputSchema: { type: 'object', properties: { accountId: { type: 'string' } } },
      },
    ];

    for (const tool of mockTools) {
      gateway.registerTool(tool);
    }

    expect(gateway.getCatalog()).toHaveLength(5);

    // Test routing for Stellar payment
    const stellarRoute = gateway.routeTools('Can you transfer 10 XLM to Bob?', 2);
    expect(stellarRoute.matchedTools.length).toBeGreaterThanOrEqual(1);
    expect(stellarRoute.matchedTools[0].name).toBe('transfer_xlm');
    expect(stellarRoute.totalCatalogSize).toBe(5);
    // Since only 1 or 2 tools routed out of 5, savings is substantial
    expect(stellarRoute.savingsPercentage).toBeGreaterThanOrEqual(60);

    // Test routing for SQL query
    const sqlRoute = gateway.routeTools('Run a SELECT query on users database table', 1);
    expect(sqlRoute.matchedTools).toHaveLength(1);
    expect(sqlRoute.matchedTools[0].name).toBe('execute_sql');
    expect(sqlRoute.savingsPercentage).toBe(80); // 1 out of 5 = 80% saved
  });

  it('should track metrics across multiple queries', () => {
    gateway.registerServerTools('github', [
      {
        name: 'create_issue',
        description: 'Create an issue on GitHub repository',
        category: 'git',
        keywords: ['github', 'issue', 'bug'],
        inputSchema: {},
      },
      {
        name: 'create_pr',
        description: 'Create a pull request on GitHub repository',
        category: 'git',
        keywords: ['github', 'pr', 'pull', 'request'],
        inputSchema: {},
      },
    ]);

    gateway.routeTools('Create a bug issue for login crash');
    gateway.routeTools('Submit a pull request');

    const metrics = gateway.getMetrics();
    expect(metrics.totalQueriesRouted).toBe(2);
    expect(metrics.registeredToolsCount).toBe(2);
    expect(metrics.registeredServers).toContain('github');
    expect(metrics.totalTokensSaved).toBeGreaterThan(0);
  });
});
