import crypto from 'crypto';

export class DoubleRatchetSession {
  private rootKey: Buffer;
  private sendingChainKey: Buffer;
  private receivingChainKey: Buffer;
  private messageNumber: number = 0;

  constructor(sharedMasterSecret: Buffer) {
    this.rootKey = crypto.createHash('sha256').update(sharedMasterSecret).digest();
    this.sendingChainKey = crypto.createHmac('sha256', this.rootKey).update('send').digest();
    this.receivingChainKey = crypto.createHmac('sha256', this.rootKey).update('recv').digest();
  }

  public ratchetSend(): { messageKey: Buffer; messageIndex: number } {
    const messageKey = crypto.createHmac('sha256', this.sendingChainKey).update('message').digest();
    this.sendingChainKey = crypto.createHmac('sha256', this.sendingChainKey).update('advance').digest();
    this.messageNumber++;
    return { messageKey, messageIndex: this.messageNumber };
  }

  public ratchetReceive(): { messageKey: Buffer } {
    const messageKey = crypto.createHmac('sha256', this.receivingChainKey).update('message').digest();
    this.receivingChainKey = crypto.createHmac('sha256', this.receivingChainKey).update('advance').digest();
    return { messageKey };
  }

  public healRatchets(newEphemeralSecret: Buffer): void {
    // Advance root key with new entropy to heal from compromise
    this.rootKey = crypto.createHmac('sha256', this.rootKey).update(newEphemeralSecret).digest();
    this.sendingChainKey = crypto.createHmac('sha256', this.rootKey).update('send_healed').digest();
    this.receivingChainKey = crypto.createHmac('sha256', this.rootKey).update('recv_healed').digest();
  }

  public getChainState(): { messageNumber: number } {
    return { messageNumber: this.messageNumber };
  }
}
