export class CharacterRepetitionGuard {
    static hasExcessiveRepetition(input, maxConsecutive = 50) {
        if (!input || typeof input !== 'string')
            return false;
        const regex = new RegExp(`(.)\\1{${maxConsecutive},}`);
        return regex.test(input);
    }
    static sanitize(input, maxConsecutive = 20) {
        if (!input || typeof input !== 'string')
            return '';
        const regex = new RegExp(`(.)\\1{${maxConsecutive},}`, 'g');
        return input.replace(regex, (match, char) => char.repeat(maxConsecutive));
    }
}
//# sourceMappingURL=character_repetition_guard.js.map