import { describe, it, expect } from 'vitest';
import { AnsiEscapeStripper } from '../src/utils/ansi_escape_stripper.js';

describe('AnsiEscapeStripper', () => {
  it('strips ANSI color codes from strings', () => {
    const colored = '\u001b[31mRed Text\u001b[0m and \u001b[32mGreen Text\u001b[0m';
    expect(AnsiEscapeStripper.hasAnsi(colored)).toBe(true);
    expect(AnsiEscapeStripper.strip(colored)).toBe('Red Text and Green Text');
  });

  it('leaves clean text unaltered', () => {
    expect(AnsiEscapeStripper.hasAnsi('Standard text output')).toBe(false);
    expect(AnsiEscapeStripper.strip('Standard text output')).toBe('Standard text output');
  });
});
