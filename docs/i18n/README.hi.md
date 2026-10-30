# 🛡️ AgentSentinel (हिन्दी मार्गदर्शिका)

> **AI एजेंट्स और मॉडल कॉन्टेक्स्ट प्रोटोकॉल (MCP) के लिए यूनिवर्सल ज़ीरो-ट्रस्ट रनटाइम सिक्योरिटी फ़ायरवॉल**

[English](../../README.md) | [हिन्दी (Hindi)](README.hi.md) | [Español (Spanish)](README.es.md)

---

## ⚡ अवलोकन (Overview)

जैसे-जैसे ऑटोनॉमस AI एजेंट्स, कोडिंग असिस्टेंट्स (Cursor, Devin, Claude Code) और **Model Context Protocol (MCP)** टूल्स का विस्तार हो रहा है, एजेंट्स को टर्मिनल कमांड्स, डेटाबेस और फाइलों पर सीधा निष्पादन (execution) अधिकार मिल रहा है।

**AgentSentinel** एक अल्ट्रा-लाइटवेट (<0.13ms लेटेंसी), ज़ीरो-डिपेंडेंसी रनटाइम सिक्योरिटी फ़ायरवॉल प्रदान करता है जो हर टूल कॉल को निष्पादन से *पहले* इंटरसेप्ट करता है। यह निम्नलिखित सुरक्षा सीमाएं लागू करता है:

- **टर्मिनल एवं शैल सुरक्षा:** विनाशकारी कमांड्स (`rm -rf /`, `mkfs`, `dd`), फोर्क बॉम्ब्स, रिवर्स शेल्स और बेस64 एन्कोडेड हमलों को रोकता है।
- **SQL एवं डेटाबेस सुरक्षा:** अनकन्स्ट्रेंड क्वेरीज़ (`DROP TABLE`, `TRUNCATE`, बिना `WHERE` क्लॉज के `DELETE`/`UPDATE`) और स्टैक्ड इंजेक्शन को ब्लॉक करता है।
- **फाइलसिस्टम सुरक्षा:** पाथ ट्रैवर्सल (`../../`), संवेदनशील डायरेक्ट्रीज़ (`/etc/shadow`, `~/.ssh`, `SAM`) और वर्कस्पेस जेल का उल्लंघन रोकता है।
- **सीक्रेट्स और PII रिडेक्शन:** AWS कीज़, GitHub PATs, PEM प्राइवेट कीज़, क्रेडिट कार्ड (Luhn चेक), SSN और आधार नंबर को क्लाइंट-साइड पर रेडैक्ट करता है।
- **क्लाउड मेटाडेटा SSRF ब्लॉकर:** AWS IMDSv1/v2, GCP, Azure और Kubernetes इंटरनल मेटाडेटा एंडपॉइंट्स पर SSRF हमलों को रोकता है।
- **नेटिव फ्रेमवर्क सपोर्ट:** MCP, Vercel AI SDK, LangChain और स्टैंडअलोन Node.js/TypeScript एजेंट्स के साथ प्लग-एंड-प्ले।

---

## 🚀 त्वरित शुरुआत (Quickstart Guide)

### 1. इंस्टॉलेशन (Installation)

npm या अपने पसंदीदा पैकेज मैनेजर के माध्यम से इंस्टॉल करें:

```bash
npm install @agentsentinel/core
```

अपने प्रोजेक्ट में डिफ़ॉल्ट सिक्योरिटी पॉलिसी इनिशियलाइज़ करें:

```bash
npx agentsentinel init
# Created security policy configuration: ./agentsentinel.policy.json
```

---

### 2. स्टैंडअलोन रनटाइम मूल्यांकन (Standalone Runtime Evaluation)

सिस्टम प्रिमिटिव्स को निष्पादित करने से पहले टूल कॉल को इंटरसेप्ट करें:

```typescript
import { SentinelEngine, Verdict, createDestructiveDeletionRule } from '@agentsentinel/core';

const engine = new SentinelEngine();
engine.registry.register(createDestructiveDeletionRule());

// टूल कॉल निष्पादित करने से पहले इंटरसेप्ट करें
const toolCall = {
  id: 'call_12345',
  toolName: 'bash_executor',
  params: {
    command: 'rm -rf / --no-preserve-root'
  },
  timestamp: Date.now()
};

const evaluation = await engine.evaluate(toolCall);

if (evaluation.verdict === Verdict.BLOCK) {
  console.error(`🚨 सुरक्षा उल्लंघन रोका गया: ${evaluation.violations[0].reason}`);
  // निष्पादन रोकें - टूल निष्पादित न करें
} else {
  // टूल सुरक्षित रूप से चलाएं
}
```

---

### 3. Model Context Protocol (MCP) सर्वर सुरक्षा

अपने MCP सर्वर के सभी टूल्स को केवल एक पंक्ति के मिडलवेयर से सुरक्षित करें:

```typescript
import { createMcpInterceptor } from '@agentsentinel/core';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const mcpServer = new Server({ name: 'my-agent-tools', version: '1.0.0' }, { capabilities: { tools: {} } });

// MCP सर्वर के चारों ओर फ़ायरवॉल सुरक्षा कवच जोड़ें
const protectedMcp = createMcpInterceptor(mcpServer, {
  blockDestructiveShell: true,
  blockUnconstrainedSQL: true,
  blockCloudMetadataSSRF: true,
  maskSecretsAndPII: true
});
```

---

### 4. Vercel AI SDK एकीकरण (Integration)

Vercel AI SDK टूल्स को `protectVercelTools` के साथ रैप करें:

```typescript
import { protectVercelTools } from '@agentsentinel/core';
import { tool } from 'ai';
import { z } from 'zod';

const myTools = {
  executeBash: tool({
    description: 'टर्मिनल में शेल कमांड चलाएं',
    parameters: z.object({ command: z.string() }),
    execute: async ({ command }) => { /* ... */ }
  })
};

// एजेंट को पास करने से पहले सभी टूल्स को सुरक्षित करें
export const protectedTools = protectVercelTools(myTools);
```

---

### 5. CLI उपयोग (Command-Line Usage)

शेल स्क्रिप्ट्स, SQL माइग्रेशन या टूल कॉल्स का सुरक्षा ऑडिट करें:

```bash
# शेल स्क्रिप्ट का सुरक्षा ऑडिट करें
npx agentsentinel run-script ./scripts/deploy.sh

# SQL माइग्रेशन का सुरक्षा परीक्षण करें
npx agentsentinel run-sql ./migrations/001_init.sql

# JSONL ऑडिट लॉग्स का विश्लेषण करें
npx agentsentinel inspect-logs ./logs/audit.jsonl
```

---

## 🏛️ आर्किटेक्चर (Architecture)

```
[ LLM / Autonomous Agent ]
           │
           ▼ (Tool Call Request)
┌───────────────────────────────────────────────┐
│              🛡️ AgentSentinel                 │
│                                               │
│  1. AST Syntax Tokenizer (Shell / SQL / Path) │
│  2. Regex Signature Matchers                  │
│  3. Entropy & Shannon Secret Detectors        │
│  4. Outbound Network & SSRF Blocker           │
│  5. HMAC Cryptographic JSONL Audit Log        │
└──────────────────────┬────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
    [ ALLOW ]                   [ BLOCK ]
         │                           │
  (Execute Tool)             (Return Error to LLM)
```

---

## 📄 लाइसेंस (License)

Apache-2.0 © [SparkySolutions](https://github.com/sparkysolutions10-pixel)
