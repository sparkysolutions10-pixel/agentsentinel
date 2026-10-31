/**
 * AgentSentinel - Base64 Instruction Sniffer Utility
 * Sniffs out Base64 encoded payload segments and flags hidden destructive shell instructions.
 */

export class Base64InstructionSniffer {
  private static readonly B64_CHUNK_REGEX = /([A-Za-z0-9+/]{16,}={0,2})/g;
  private static readonly DANGEROUS_TOKENS = [
    'rm -rf',
    'powershell',
    'curl http',
    'wget http',
    '/bin/sh',
    '/bin/bash',
    'Invoke-Expression'
  ];

  public static extractDecodedSuspiciousStrings(text: string): string[] {
    if (!text || typeof text !== 'string') return [];
    const matches = text.match(this.B64_CHUNK_REGEX);
    if (!matches) return [];

    const suspicious: string[] = [];
    for (const chunk of matches) {
      try {
        const decoded = Buffer.from(chunk, 'base64').toString('utf-8');
        for (const token of this.DANGEROUS_TOKENS) {
          if (decoded.toLowerCase().includes(token.toLowerCase())) {
            suspicious.push(decoded);
            break;
          }
        }
      } catch {
        // Ignore unparseable chunks
      }
    }

    return suspicious;
  }
}
