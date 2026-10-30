# 🛡️ AgentSentinel (Guía en Español)

> **El Firewall de Seguridad en Tiempo de Ejecución y Guardián Zero-Trust Universal para Agentes de IA y Model Context Protocol (MCP)**

[English](../../README.md) | [हिन्दी (Hindi)](README.hi.md) | [Español (Spanish)](README.es.md)

---

## ⚡ Descripción General (Overview)

A medida que los agentes de IA autónomos, los asistentes de código (Cursor, Devin, Claude Code) y las herramientas basadas en el **Model Context Protocol (MCP)** se expanden, los agentes obtienen acceso de ejecución directa a terminales, bases de datos relacionales, sistemas de archivos y APIs internas.

**AgentSentinel** proporciona un firewall de seguridad en tiempo de ejecución ultra-ligero (<0.13ms de latencia) y sin dependencias que intercepta cada llamada de herramienta *antes* de su ejecución. Implementa los siguientes límites de seguridad:

- **Defensa de Terminal y Shell:** Bloquea comandos destructivos (`rm -rf /`, `mkfs`, `dd`), bombas fork, shells inversas y ejecuciones ofuscadas en base64.
- **Defensa de SQL y Bases de Datos:** Intercepta consultas destructivas o sin restricciones (`DROP TABLE`, `TRUNCATE`, `DELETE`/`UPDATE` sin cláusula `WHERE`) y ataques de inyección múltiple.
- **Confinamiento del Sistema de Archivos:** Bloquea saltos de directorio (`../../`), inspección de directorios sensibles (`/etc/shadow`, `~/.ssh`, `SAM`) y asegura cárceles de espacio de trabajo raíz.
- **Redacción de Secretos y Datos PII:** Detección en el cliente (cero telemetría) de claves AWS, PATs de GitHub, claves privadas PEM, verificación Luhn de tarjetas de crédito, números de Seguro Social (SSN) y Aadhaar.
- **Bloqueador de SSRF de Metadatos en la Nube:** Impide ataques SSRF contra endpoints de metadatos de AWS IMDSv1/v2, Google Cloud, Azure y Kubernetes.
- **Integración Nativa con Frameworks:** Middleware listo para usar en **MCP**, **Vercel AI SDK**, **LangChain** y agentes independientes de Node.js/TypeScript.

---

## 🚀 Guía de Inicio Rápido (Quickstart)

### 1. Instalación (Installation)

Instala mediante npm o tu gestor de paquetes preferido:

```bash
npm install @agentsentinel/core
```

Inicializa una política de seguridad empresarial en tu proyecto:

```bash
npx agentsentinel init
# Archivo de política creado: ./agentsentinel.policy.json
```

---

### 2. Evaluación en Tiempo de Ejecución Independiente (Standalone Runtime Evaluation)

Intercepta la ejecución de herramientas antes de invocar comandos del sistema:

```typescript
import { SentinelEngine, Verdict, createDestructiveDeletionRule } from '@agentsentinel/core';

const engine = new SentinelEngine();
engine.registry.register(createDestructiveDeletionRule());

// Intercepta la llamada a la herramienta antes de ejecutar
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
  console.error(`🚨 Violación de seguridad bloqueada: ${evaluation.violations[0].reason}`);
  // Cancela la ejecución - no ejecutes la herramienta
} else {
  // Ejecuta la herramienta de forma segura
}
```

---

### 3. Seguridad para Servidores Model Context Protocol (MCP)

Protege todas las herramientas de tu servidor MCP con una sola línea de middleware:

```typescript
import { createMcpInterceptor } from '@agentsentinel/core';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const mcpServer = new Server({ name: 'my-agent-tools', version: '1.0.0' }, { capabilities: { tools: {} } });

// Añade el escudo de seguridad del firewall alrededor del servidor MCP
const protectedMcp = createMcpInterceptor(mcpServer, {
  blockDestructiveShell: true,
  blockUnconstrainedSQL: true,
  blockCloudMetadataSSRF: true,
  maskSecretsAndPII: true
});
```

---

### 4. Integración con Vercel AI SDK

Envuelve las herramientas de Vercel AI SDK con `protectVercelTools`:

```typescript
import { protectVercelTools } from '@agentsentinel/core';
import { tool } from 'ai';
import { z } from 'zod';

const myTools = {
  executeBash: tool({
    description: 'Ejecuta comandos shell en la terminal',
    parameters: z.object({ command: z.string() }),
    execute: async ({ command }) => { /* ... */ }
  })
};

// Protege todas las herramientas antes de entregarlas al modelo
export const protectedTools = protectVercelTools(myTools);
```

---

### 5. Uso desde la Línea de Comandos (CLI)

Audita scripts de shell, migraciones SQL o registros de herramientas:

```bash
# Audita la seguridad de un script de shell
npx agentsentinel run-script ./scripts/deploy.sh

# Verifica la seguridad de una migración SQL
npx agentsentinel run-sql ./migrations/001_init.sql

# Inspecciona registros de auditoría JSONL
npx agentsentinel inspect-logs ./logs/audit.jsonl
```

---

## 🏛️ Arquitectura (Architecture)

```
[ LLM / Agente Autónomo ]
           │
           ▼ (Solicitud de Herramienta)
┌───────────────────────────────────────────────┐
│              🛡️ AgentSentinel                 │
│                                               │
│  1. Analizador Sintáctico AST (Shell/SQL/Ruta)│
│  2. Detectores de Firmas Regex                │
│  3. Detectores de Entropía Shannon (Secretos) │
│  4. Bloqueador de SSRF y Red Saliente         │
│  5. Registro Criptográfico HMAC en JSONL      │
└──────────────────────┬────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
    [ ALLOW ]                   [ BLOCK ]
         │                           │
  (Ejecutar Herramienta)      (Retornar Error al LLM)
```

---

## 📄 Licencia (License)

Apache-2.0 © [SparkySolutions](https://github.com/sparkysolutions10-pixel)
