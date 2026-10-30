# 🛠️ AgentSentinel Troubleshooting & Violation Recovery Guide

This guide details common security violations, false-positive calibrations, and recovery strategies when integrating **AgentSentinel** with autonomous AI agents, coding assistants, and Model Context Protocol (MCP) servers.

---

## 🧭 Diagnostic Quickstart: Reading Audit Logs

Every tool evaluation performed by AgentSentinel emits an HMAC-signed audit log to your configured sink or default JSONL file (`audit.jsonl`).

To inspect recent security blocks and violations from the terminal:

```bash
# Inspect all critical violations and blocking events
npx agentsentinel inspect-logs ./audit.jsonl --filter=BLOCK

# Test scripts or policies in non-blocking dry-run mode
npx agentsentinel run-script ./scripts/build.sh --dry-run
```

Sample Violation Entry:
```json
{
  "timestamp": 1729864200000,
  "toolName": "bash_executor",
  "verdict": "BLOCK",
  "violations": [
    {
      "ruleId": "shell-block-destructive",
      "severity": "critical",
      "reason": "Recursive deletion targeting critical directory: \"/\"",
      "detectedPattern": "rm -rf /"
    }
  ]
}
```

---

## 📋 Common Violations & Recovery Solutions

### 1. Destructive Shell Command Intercepted (`shell-block-destructive`)

- **Symptom:** Your agent tries to run a clean command (e.g. `rm -rf dist` or `npm run clean`), but AgentSentinel issues a `BLOCK` verdict.
- **Root Cause:** If the command is passed without path qualification (e.g. `rm -rf /*` or unexpanded shell variables like `rm -rf $DIR/`), the parser treats it as an unconstrained root deletion risk.
- **Recovery:**
  1. Ensure paths are resolved relative to the workspace:
     ```bash
     # Instead of:
     rm -rf /dist
     # Use explicit local relative path:
     rm -rf ./dist
     ```
  2. For dev sandboxes where aggressive cleanups are common, use `presets/developer-sandbox.policy.json` or register an explicit rule override for `dist/` or `target/`.

---

### 2. SQL Unconstrained Delete or Truncate Blocked (`sql-block-unconstrained-delete`)

- **Symptom:** Agent attempts to clean a test table (`DELETE FROM test_users;` or `TRUNCATE TABLE cache;`) and receives a `BLOCK`.
- **Root Cause:** Enterprise production policy prohibits queries that modify or delete all rows without an explicit `WHERE` constraint.
- **Recovery:**
  1. Add an explicit condition to the agent prompt or SQL query:
     ```sql
     -- Blocked:
     DELETE FROM test_users;

     -- Allowed:
     DELETE FROM test_users WHERE 1 = 1; -- or WHERE id > 0;
     ```
  2. In local test pipelines, load the developer preset (`presets/developer-sandbox.policy.json`) which converts `TRUNCATE` from a hard `BLOCK` to an interactive `CONFIRM` prompt.

---

### 3. Secret Scrubber False Positives on Hashes or Checksums (`secrets-shannon-entropy`)

- **Symptom:** Git commit hashes (SHA-1), package integrity checksums (SHA-256), or random UUIDs are detected as high-entropy secrets and redacted.
- **Root Cause:** Shannon entropy for random hex strings can exceed the default threshold (> 4.5 bits/symbol).
- **Recovery:**
  1. Adjust the entropy threshold when initializing the entropy matcher:
     ```typescript
     import { createEntropyMatcherRule } from '@agentsentinel/core';

     // Calibrate threshold from 4.5 to 5.2 for codebases with heavy hashing
     const entropyRule = createEntropyMatcherRule({
       threshold: 5.2,
       minWordLength: 20
     });
     engine.registerRule(entropyRule);
     ```
  2. Add legitimate public hashes or repository IDs to the allowlist:
     ```typescript
     import { addPublicAllowlistEntry } from '@agentsentinel/core';
     addPublicAllowlistEntry('commit-sha', 'a1b2c3d4e5f67890...');
     ```

---

### 4. Filesystem Operation Blocked Outside Workspace Jail (`fs-workspace-jail-validator`)

- **Symptom:** Agent receives `Filesystem operation outside workspace jail intercepted` when reading system headers or temporary files in `/tmp` or `%TEMP%`.
- **Root Cause:** By default, `WorkspaceJail` strictly confines all read/write operations to the active repository directory.
- **Recovery:**
  Configure multiple allowed root directories:
  ```typescript
  import os from 'os';
  import { createWorkspaceJailGuardRule } from '@agentsentinel/core';

  engine.registerRule(createWorkspaceJailGuardRule({
    allowedRoots: [
      process.cwd(),
      os.tmpdir() // Grant access to OS temp directory
    ]
  }));
  ```

---

### 5. Cloud Metadata SSRF Blocked (`network-block-cloud-metadata-ssrf`)

- **Symptom:** An agent calling an internal service gets blocked because the URL matches link-local addresses.
- **Root Cause:** The target URL uses `169.254.169.254`, `instance-data`, `metadata.google.internal`, or obfuscated decimal IP `2852039166`.
- **Recovery:**
  - Legitimate local mock servers should always bind to loopback addresses (`127.0.0.1` or `localhost`), never AWS/GCP link-local metadata IPs (`169.254.169.254`).
  - If mocking cloud metadata during unit tests, use mock functions at the SDK layer rather than directing HTTP requests to actual metadata IP addresses.

---

### 6. Runaway Tool Loop Rate Limiter Triggered (`rules-tool-loop-rate-limiter`)

- **Symptom:** Autonomous agent suddenly stops with `Tool call intercepted: Runaway circular tool execution loop detected`.
- **Root Cause:** The agent encountered an error and repeatedly called the exact same tool with the exact same arguments in a tight retry loop (default limit: 5 consecutive calls within 10 seconds).
- **Recovery:**
  1. Ensure the agent receives structured error messages so it can adjust parameters instead of blindly retrying.
  2. If high frequency polling is required for a specific tool, customize the rate limiter window:
     ```typescript
     import { createToolLoopRateLimiterRule } from '@agentsentinel/core';

     engine.registerRule(createToolLoopRateLimiterRule({
       maxConsecutiveIdenticalCalls: 15,
       windowMs: 30000
     }));
     ```

---

### 7. Outbound Network Allowlist Denials (`network-destination-allowlist`)

- **Symptom:** Agent cannot fetch documentation from a new external domain (e.g. `docs.stripe.com`).
- **Root Cause:** The strict enterprise zero-trust policy restricts outbound HTTP/socket destinations to pre-approved domains.
- **Recovery:**
  Add the target wildcard domain to the network allowlist:
  ```typescript
  import { createNetworkAllowlistGuardRule } from '@agentsentinel/core';

  engine.registerRule(createNetworkAllowlistGuardRule({
    allowedDomains: [
      'api.github.com',
      'api.openai.com',
      'api.anthropic.com',
      '*.stripe.com' // Allow Stripe APIs and docs
    ]
  }));
  ```

---

## 🔍 Exit Codes Reference (CLI)

When running `agentsentinel` via the command-line interface, inspect the exit code:

| Exit Code | Meaning | Action Needed |
| :---: | :--- | :--- |
| **0** | **Clean / Allowed** | Tool execution permitted without violations. |
| **1** | **Security Violation (Blocked)** | Prohibited command or query blocked by policy. |
| **2** | **Confirmation Rejected / Timeout** | Interactive confirmation was declined or timed out. |
| **3** | **Missing Argument / Invalid Input** | Verify CLI arguments (`--file`, `--script`). |
| **4** | **Syntax / JSON Parse Error** | Verify valid JSON policy or SQL syntax. |

---

## 💬 Getting Further Help

If you encounter unexpected policy behavior or want to contribute new detection heuristics:
- Open an issue on GitHub: [sparkysolutions10-pixel/agentsentinel/issues](https://github.com/sparkysolutions10-pixel/agentsentinel/issues)
- Review benchmark latency: [BENCHMARKS.md](BENCHMARKS.md)
- Check architecture internals: [ARCHITECTURE.md](ARCHITECTURE.md)
