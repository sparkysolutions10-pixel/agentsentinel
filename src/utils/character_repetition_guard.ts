export class CharacterRepetitionGuard {
  public static hasExcessiveRepetition(input: string, maxConsecutive: number = 50): boolean {
    if (!input || typeof input !== 'string') return false;
    const regex = new RegExp(`(.)\\1{${maxConsecutive},}`);
    return regex.test(input);
  }

  public static sanitize(input: string, maxConsecutive: number = 20): string {
    if (!input || typeof input !== 'string') return '';
    const regex = new RegExp(`(.)\\1{${maxConsecutive},}`, 'g');
    return input.replace(regex, (match, char) => char.repeat(maxConsecutive));
  }
}
