# 🛡️ AgentSentinel

> **The Universal Zero-Trust Security Firewall & Runtime Guard for AI Agents & Model Context Protocol (MCP)**

[![CI](https://github.com/sparkysolutions10-pixel/agentsentinel/actions/workflows/ci.yml/badge.svg)](https://github.com/sparkysolutions10-pixel/agentsentinel/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0_Runtime-success)](package.json)
[![Benchmarks: Sub-2ms](https://img.shields.io/badge/Latency-%3C0.13ms%20Mean-brightgreen)](BENCHMARKS.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](CONTRIBUTING.md)
[![Good First Issues](https://img.shields.io/github/issues/sparkysolutions10-pixel/agentsentinel/good%20first%20issue?color=purple&label=good%20first%20issues)](https://github.com/sparkysolutions10-pixel/agentsentinel/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
[![Security: OWASP Top 10](https://img.shields.io/badge/OWASP%20LLM-ASI01--ASI05%20Defense-red)](https://owasp.org/www-project-top-10-for-large-language-model-applications/)

---

**Languages:** [English](README.md) | [हिन्दी (Hindi)](docs/i18n/README.hi.md) | [Español (Spanish)](docs/i18n/README.es.md)

---

## ⚡ Overview

As autonomous AI agents, coding assistants (Cursor, Devin, Claude Code), and **Model Context Protocol (MCP)** tools proliferate, agents gain direct execution access to terminal commands, relational databases, filesystems, and internal APIs.

**AgentSentinel** provides a lightweight, sub-2ms, zero-dependency runtime security firewall that intercepts every tool call *before* execution. It inspects abstract syntax trees (ASTs), regex signatures, and behavioral limits to enforce strict security boundaries:

- **Terminal & Shell Defense:** Blocks recursive wiping (`rm -rf /`), raw disk formats (`mkfs`, `dd`), fork bombs, reverse shells, and base64-obfuscated execution.
- **SQL & Database Defense:** Intercepts unconstrained queries (`DROP TABLE`, `TRUNCATE`, `DELETE`/`UPDATE` without `WHERE`), and stacked injection attacks.
- **Filesystem Confinement:** Blocks path traversal (`../../`), sensitive directory introspection (`/etc/shadow`, `~/.ssh`, `SAM`), and enforces root workspace jails.
- **Secret & PII Redaction:** Client-side zero-telemetry scanning for AWS keys, GitHub PATs, private keys, Credit Card Luhn verification, SSN, and Aadhaar numbers.
- **Framework Middleware:** First-class plug-and-play middleware for **MCP**, **Vercel AI SDK**, **LangChain**, and standalone TypeScript/Node.js agents.

---

## 🚀 Quickstart Guide

### 1. Installation

Install via npm or your preferred package manager:

```bash
npm install @agentsentinel/core
```

Initialize an enterprise policy in your project repository:

```bash
npx agentsentinel init
# Created security policy configuration: ./agentsentinel.policy.json
```

---

### 2. Standalone Runtime Evaluation

Intercept tool execution before dispatching to system primitives:

```typescript
import { SentinelEngine, Verdict } from '@agentsentinel/core';
import { createDestructiveDeletionRule } from '@agentsentinel/core';

const engine = new SentinelEngine();
engine.registry.register(createDestructiveDeletionRule());

// Intercept tool call before running
const result = await engine.evaluate({
  id: 'call_01',
  toolName: 'bash:execute',
  category: 'shell',
  params: { command: 'rm -rf / --no-preserve-root' },
  timestamp: Date.now()
});

if (result.verdict === Verdict.BLOCK) {
  console.error('🚫 Blocked dangerous command:', result.violations[0].reason);
} else {
  // Execute safely
}
```

---

### 3. Model Context Protocol (MCP) Middleware

Wrap your MCP server handlers with zero-trust firewall policy:

```typescript
import { createMcpInterceptor, SentinelEngine } from '@agentsentinel/core';

const engine = new SentinelEngine();
const mcpGuard = createMcpInterceptor(engine, {
  denyTools: ['admin_wipe_cluster'],
  errorMode: 'tool_result_error',
});

// Wrap existing MCP tool handler
const safeBashHandler = mcpGuard.wrapToolHandler('bash_exec', async (args) => {
  return { stdout: await executeShell(args.command) };
});

// Prohibited calls return formatted MCP error results with isError: true
const response = await safeBashHandler({ command: ':(){ :|:& };:' });
// { isError: true, content: [{ type: 'text', text: '[AgentSentinel MCP Guard] ...' }] }
```

---

### 4. Vercel AI SDK Integration

Protect an entire dictionary of Vercel AI SDK tools in a single line:

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import { protectVercelTools, SentinelEngine } from '@agentsentinel/core';

const engine = new SentinelEngine();

const rawTools = {
  runCommand: tool({
    description: 'Execute shell command',
    parameters: z.object({ command: z.string() }),
    execute: async ({ command }) => ({ output: `Ran: ${command}` }),
  }),
  queryDatabase: tool({
    description: 'Query database',
    parameters: z.object({ query: z.string() }),
    execute: async ({ query }) => ({ rows: [] }),
  }),
};

// Guard all tools with AgentSentinel
export const tools = protectVercelTools(rawTools, { engine });
```

---

### 5. LangChain StructuredTool Integration

Guard LangChain tools against malicious tool parameters:

```typescript
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { wrapLangChainTool, SentinelEngine } from '@agentsentinel/core';

const engine = new SentinelEngine();

const calculatorTool = new DynamicStructuredTool({
  name: 'db_tool',
  description: 'Executes SQL on DB',
  schema: z.object({ query: z.string() }),
  func: async ({ query }) => 'query results...',
});

// Wrap tool with policy guard
export const guardedTool = wrapLangChainTool(calculatorTool, {
  engine,
  returnDirectOnError: true, // Returns violation explanation to agent rather than crashing chain
});
```

---

### 6. Command-Line Interface (CLI)

AgentSentinel includes a zero-dependency CLI for auditing scripts, SQL files, and logs in CI/CD pipelines:

```bash
# Audit a shell script before execution (Exit code 0 on clean, 1 on blocked)
agentsentinel audit ./scripts/deploy.sh

# Audit a SQL migration file for unconstrained DROP or DELETE statements
agentsentinel audit ./migrations/v2_patch.sql

# Test an inline command with JSON output
agentsentinel check --cmd "rm -rf /" --format json

# Audit an AgentSentinel structured audit log
agentsentinel audit-log ./logs/agent_audit.jsonl
```

---

## 📊 Performance Benchmarks

AgentSentinel is engineered for ultra-low latency with **zero runtime dependencies**:

| Metric | Target SLA | Benchmark Performance |
|---|---|---|
| **Mean Latency** | $< 2.0\text{ ms}$ | **$0.125\text{ ms}$** ($125\ \mu\text{s}$) |
| **Median (p50)** | $< 1.0\text{ ms}$ | **$0.110\text{ ms}$** ($110\ \mu\text{s}$) |
| **95th Percentile (p95)** | $< 3.0\text{ ms}$ | **$0.280\text{ ms}$** ($280\ \mu\text{s}$) |
| **Throughput** | $> 2,000\text{ ops/sec}$ | **$\sim 8,000\text{ ops/sec}$** |
| **Network Egress** | Zero | **$0\text{ bytes}$ (Air-Gapped Client-Side)** |

Detailed benchmark methodology and percentiles are documented in [BENCHMARKS.md](BENCHMARKS.md). System architecture specifications are available in [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 📄 License

Apache-2.0 © 2026 sparkysolutions10-pixel
