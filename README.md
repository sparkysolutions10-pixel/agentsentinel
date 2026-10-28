# 🛡️ AgentSentinel

> **The Universal Zero-Trust Security Firewall & Runtime Guard for AI Agents & Model Context Protocol (MCP)**

[![CI](https://github.com/sparkysolutions10-pixel/agentsentinel/actions/workflows/ci.yml/badge.svg)](https://github.com/sparkysolutions10-pixel/agentsentinel/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0_Runtime-success)](package.json)
[![Security: OWASP Top 10](https://img.shields.io/badge/OWASP%20LLM-ASI01--ASI05%20Defense-red)](https://owasp.org/www-project-top-10-for-large-language-model-applications/)

---

## ⚡ Overview

As autonomous AI agents, coding assistants (Cursor, Devin, Claude Code), and **Model Context Protocol (MCP)** tools proliferate, agents gain direct execution access to terminal commands, relational databases, filesystems, and financial APIs.

**AgentSentinel** provides a lightweight, sub-2ms, zero-dependency runtime security firewall that intercepts every tool call *before* execution. It inspects abstract syntax trees (ASTs), regex signatures, and behavioral limits to enforce strict security boundaries:

- **Terminal & Shell Defense:** Blocks recursive wiping (`rm -rf /`), raw disk formats (`mkfs`, `dd`), fork bombs, reverse shells, and base64-obfuscated execution.
- **SQL & Database Defense:** Intercepts unconstrained queries (`DROP TABLE`, `TRUNCATE`, `DELETE` without `WHERE`).
- **Filesystem Confinement:** Blocks path traversal (`../../`), sensitive directory introspection (`/etc/shadow`, `~/.ssh`), and unauthorized `.git/hooks` modifications.
- **Secret & PII Redaction:** In-memory client-side scanning for OpenAI/Anthropic API keys, AWS credentials, GitHub PATs, private keys, and credit cards.
- **Framework Middleware:** First-class plug-and-play middleware for **MCP**, **Vercel AI SDK**, **LangChain**, and standalone TypeScript/Node.js agents.

---

## 🏛️ Architecture

```
                 +-----------------------+
                 |  LLM / AI Agent / MCP |
                 +-----------+-----------+
                             |
                     Tool Call Context
                             v
           +-----------------------------------+
           |        AgentSentinel Engine       |
           |  (Priority-Weighted Rule Pipeline)|
           +-----------------+-----------------+
                             |
         +-------------------+-------------------+
         |                   |                   |
         v                   v                   v
+-----------------+ +-----------------+ +-----------------+
|  Shell & Bash   | |   SQL & DB AST  | |  Secret / PII   |
| Security Rules  | |  Safety Guard   | | Redaction Engine|
+-----------------+ +-----------------+ +-----------------+
         |                   |                   |
         +-------------------+-------------------+
                             |
                 Verdict: ALLOW | BLOCK | REDACT | CONFIRM
                             v
                 +-----------------------+
                 | OS / Database / API   |
                 +-----------------------+
```

---

## 🚀 Quickstart

```bash
npm install @agentsentinel/core
```

```typescript
import { SentinelEngine, Verdict } from '@agentsentinel/core';

const engine = new SentinelEngine();

// Evaluate a tool call before running it
const result = await engine.evaluate({
  id: 'call_01',
  toolName: 'bash:execute',
  params: { command: 'rm -rf / --no-preserve-root' },
  timestamp: Date.now()
});

if (result.verdict === Verdict.BLOCK) {
  console.error('Blocked dangerous command:', result.violations);
} else {
  // Safe to execute
}
```

---

## 📊 Roadmap & Modular Issue Tracking

AgentSentinel is engineered with strict modularity across 130 discrete milestones:
- **Phase 1: Core Engine & Interceptor Architecture** (Issues #1 – #25)
- **Phase 2: Terminal & Shell Command Defense** (Issues #26 – #55)
- **Phase 3: SQL, Database & Filesystem Confinement** (Issues #56 – #80)
- **Phase 4: Secrets, PII & Data Leak Prevention** (Issues #81 – #105)
- **Phase 5: Framework Adapters (MCP, Vercel, LangChain) & Benchmarks** (Issues #106 – #130)

---

## 📄 License

Apache-2.0 © 2026 sparkysolutions10-pixel
