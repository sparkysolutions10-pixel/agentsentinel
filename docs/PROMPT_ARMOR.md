# AgentSentinel PromptArmor Specification & Developer Guide

## Overview
AgentSentinel PromptArmor provides zero-trust defense against LLM prompt injection, delimiter spoofing, homoglyph obfuscation, and cognitive jailbreaks.

## Core Capabilities
1. **AST Tokenizer & Boundary Detection:** Identifies `<system>`, `[INST]`, `<|im_start|>` injections.
2. **Homoglyph & Invisible Unicode Defense:** Maps Cyrillic/Greek lookalikes and strips zero-width spaces.
3. **Encoding & Multi-Layer Unwrapping:** Recursively peels Base64, Rot13, Hex, and URL percent encodings.
4. **Jailbreak Recognition:** Blocks DAN modes, emotional coercion, evil twin personas, and simulated developer environments.
5. **System Prompt Canary:** Traps model output leaks using cryptographic canary tokens.

## Quick Start
```typescript
import { createUnifiedPromptArmorRule } from 'agentsentinel';

const rule = createUnifiedPromptArmorRule();
const violation = rule.evaluate({
  id: 'llm-1',
  toolName: 'llm_call',
  params: { prompt: 'User input here...' },
  timestamp: Date.now()
});

if (violation) {
  console.error(`Prompt blocked: ${violation.reason}`);
}
```
