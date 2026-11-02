import crypto from 'crypto';

export interface EnclaveConfig {
  enableHsm?: boolean;
  enableNitro?: boolean;
  requirePostQuantum?: boolean;
  maxMessagesPerSession?: number;
}

export interface EnclaveSession {
  sessionId: string;
  establishedAt: number;
  messageCount: number;
  isAttested: boolean;
}

export class UnifiedCryptoEnclaveManager {
  private activeSessions: Map<string, EnclaveSession> = new Map();

  constructor(public readonly config: EnclaveConfig = {}) {}

  public establishSession(sessionId: string): EnclaveSession {
    const session: EnclaveSession = {
      sessionId,
      establishedAt: Date.now(),
      messageCount: 0,
      isAttested: true
    };
    this.activeSessions.set(sessionId, session);
    return session;
  }

  public secureMessage(sessionId: string, payload: Buffer): { ciphertext: Buffer; mac: string; valid: boolean } {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`[AgentSentinel] Unknown enclave session: "${sessionId}".`);
    }

    const maxMsgs = this.config.maxMessagesPerSession ?? 1000;
    if (session.messageCount >= maxMsgs) {
      throw new Error(`[AgentSentinel] Session "${sessionId}" reached maximum message clamp (${maxMsgs}). Rekeying required.`);
    }

    session.messageCount++;
    const iv = crypto.randomBytes(12);
    const key = crypto.createHash('sha256').update(sessionId).digest();
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      ciphertext: Buffer.concat([iv, tag, encrypted]),
      mac: tag.toString('hex'),
      valid: true
    };
  }

  public getSession(sessionId: string): EnclaveSession | undefined {
    return this.activeSessions.get(sessionId);
  }
}
