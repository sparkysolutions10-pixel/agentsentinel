import { describe, it, expect } from 'vitest';
import { AgentSecurityHealthBadgeGenerator } from '../src/utils/agent_security_health_badge_generator.js';

describe('AgentSecurityHealthBadgeGenerator', () => {
  it('generates valid vector SVG badge string', () => {
    const svg = AgentSecurityHealthBadgeGenerator.generateSvgBadge('Security', 'Passing', '#10b981');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('Security');
    expect(svg).toContain('Passing');
    expect(svg.endsWith('</svg>')).toBe(true);
  });
});
