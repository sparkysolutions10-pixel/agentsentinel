import { describe, it, expect } from 'vitest';
import { UnifiedCryptoEnclaveManager } from '../src/crypto/enclave_orchestrator.js';

describe('Unified CryptoEnclave Manager (#875 & #876)', () => {
  it('establishes secure session and protects payload through full pipeline', () => {
    const manager = new UnifiedCryptoEnclaveManager({ maxMessagesPerSession: 5 });
    const session = manager.establishSession('agent-session-007');
    expect(session.isAttested).toBe(true);
    expect(session.messageCount).toBe(0);

    const data = Buffer.from('confidential-llm-tool-parameters');
    const secured = manager.secureMessage('agent-session-007', data);
    expect(secured.valid).toBe(true);
    expect(secured.ciphertext.length).toBeGreaterThan(data.length);
    expect(manager.getSession('agent-session-007')?.messageCount).toBe(1);
  });

  it('enforces session message boundary clamp', () => {
    const manager = new UnifiedCryptoEnclaveManager({ maxMessagesPerSession: 2 });
    manager.establishSession('agent-clamp-session');

    manager.secureMessage('agent-clamp-session', Buffer.from('msg1'));
    manager.secureMessage('agent-clamp-session', Buffer.from('msg2'));

    expect(() => {
      manager.secureMessage('agent-clamp-session', Buffer.from('msg3'));
    }).toThrow('reached maximum message clamp');
  });
});
