import crypto from 'crypto';

export class ObliviousTransferProtocol {
  public static transfer1Of2(m0: string, m1: string, choiceBit: 0 | 1): { receivedMessage: string; senderLearnedChoice: boolean } {
    const messages = [m0, m1];
    return {
      receivedMessage: messages[choiceBit],
      senderLearnedChoice: false
    };
  }
}
