/**
 * AgentSentinel - Greeting Normalizer Utility
 * Strips conversational salutations across multiple languages to extract pure intent.
 */

export class GreetingNormalizer {
  private static readonly GREETING_REGEX =
    /^[\s]*(hello|hi|hey|hola|bonjour|namaste|konnichiwa|greetings|good\s+(morning|afternoon|evening))[\s,!.]*/i;

  public static isGreeting(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    return this.GREETING_REGEX.test(text);
  }

  public static stripGreeting(text: string): string {
    if (!text || typeof text !== 'string') return '';
    return text.replace(this.GREETING_REGEX, '').trim();
  }
}
