# AgentSentinel - Soroban & Stellar Web3 Security Guide

Autonomous AI agents executing smart contract invocations and token transfers on the Stellar network require comprehensive runtime guardrails. AgentSentinel provides zero-overhead, multi-layered security controls.

## 1. Quickstart

```typescript
import { SentinelEngine } from 'agentsentinel';
import { loadSorobanStrictPreset } from 'agentsentinel/web3';

const engine = new SentinelEngine();
loadSorobanStrictPreset(engine, {
  maxTransferAmount: 10000,
  maxSlippagePercent: 0.5
});

const evaluation = await engine.evaluate({
  id: 'tx_eval_1',
  toolName: 'soroban_token_transfer',
  params: { to: 'GBBD67IFDDNVVUWW7AUXCXP22OHGDBC3TVN', amount: 500 },
  timestamp: Date.now()
});

if (!evaluation.allowed) {
  console.error('Security violation intercepted:', evaluation.violations);
}
```

## 2. Multi-Layered Protection Modules

1. **State Rent & Storage Architecture**: Footprint boundaries, TTL monitoring, rent curve modeling, storage capacity clamps.
2. **Contract Auth & Signatures**: Cryptographic tree verification, StrKey validation, multi-sig threshold verification.
3. **Reentrancy & Atomic Batches**: Call depth limiting, cross-contract callback interception, rollback monitoring.
4. **MEV, AMM & Flash Loan Defense**: Slippage tolerance enforcers, sandwich attack tripwires, pool reserve drain clamps.
5. **SEP-41 Token Interface**: Transfer ceilings, zero-address burn interceptors, allowance auto-revoke guards.
6. **Horizon & RPC Failover**: Rate limiting, health monitoring, response hash integrity verification.
7. **WASM Bytecode Scanner**: Header validation, loop scanners, host import filters, linear memory ceiling guards.
8. **Path Payments**: Strict send/receive slippage clamps, circular arbitrage detection, hop count limits.
9. **Event Telemetry**: Diagnostic event parsing, event topic schemas, cryptographic ledger audit anchoring.
