/**
 * AgentSentinel - Web3 Tool Call Fuzz Harness
 * Generates boundary fuzz vectors (NaN, prototype keys, negative bigints, nulls)
 * to verify rules gracefully evaluate without uncaught runtime exceptions.
 */
export class Web3ToolFuzzHarness {
    static FUZZ_VALUES = [
        null,
        undefined,
        NaN,
        Infinity,
        -Infinity,
        -1,
        -999999999999999n,
        0,
        '',
        '0x',
        '\x00\x00',
        '__proto__',
        'constructor',
        'prototype',
        {},
        [],
        [null, undefined],
        'G' + 'A'.repeat(55),
        '0x' + '00'.repeat(32)
    ];
    static fuzzRule(rule, toolName = 'fuzz_tool_call') {
        let crashes = 0;
        let violationsFound = 0;
        for (let i = 0; i < Web3ToolFuzzHarness.FUZZ_VALUES.length; i++) {
            const val = Web3ToolFuzzHarness.FUZZ_VALUES[i];
            const context = {
                id: `fuzz_${i}_${Date.now()}`,
                toolName,
                params: {
                    to: val,
                    amount: val,
                    destination: val,
                    proof: val,
                    signature: val,
                    sequence: val,
                    [String(val)]: val
                },
                timestamp: Date.now()
            };
            try {
                const violation = rule.evaluate(context);
                if (violation !== null) {
                    violationsFound++;
                }
            }
            catch {
                crashes++;
            }
        }
        return {
            totalIterations: Web3ToolFuzzHarness.FUZZ_VALUES.length,
            crashes,
            violationsFound,
            passed: crashes === 0
        };
    }
}
//# sourceMappingURL=tool_fuzz_harness.js.map