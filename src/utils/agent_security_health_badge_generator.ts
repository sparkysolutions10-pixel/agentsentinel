/**
 * AgentSecurityHealthBadgeGenerator - SVG compliance badge generator.
 */

export class AgentSecurityHealthBadgeGenerator {
  public static generateSvgBadge(label: string, status: string, colorHex: string = '#10b981'): string {
    const width = 160;
    const height = 28;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${label}: ${status}">
  <linearGradient id="b" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="a"><rect width="${width}" height="${height}" rx="4" fill="#fff"/></clipPath>
  <g clip-path="url(#a)">
    <rect width="90" height="${height}" fill="#1e293b"/>
    <rect x="90" width="70" height="${height}" fill="${colorHex}"/>
    <rect width="${width}" height="${height}" fill="url(#b)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="45" y="18" fill="#fff">${label}</text>
    <text x="125" y="18" fill="#fff" font-weight="bold">${status}</text>
  </g>
</svg>`;
  }
}
