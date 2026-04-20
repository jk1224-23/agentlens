// ===== Guide Icons (SVG) =====
// Each icon is a 48×48 monospace-grid design
// Use as: iconHTML('orchestration') returns an SVG string

const GUIDE_ICONS = {
  orchestration: () => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" overflow="visible"><circle cx="24" cy="24" r="4" fill="currentColor" stroke="currentColor" stroke-width="0.5"/><circle cx="24" cy="10" r="2.5" fill="currentColor" opacity="0.6"/><circle cx="35" cy="18" r="2.5" fill="currentColor" opacity="0.6"/><circle cx="35" cy="30" r="2.5" fill="currentColor" opacity="0.6"/><circle cx="24" cy="38" r="2.5" fill="currentColor" opacity="0.6"/><circle cx="13" cy="30" r="2.5" fill="currentColor" opacity="0.6"/><circle cx="13" cy="18" r="2.5" fill="currentColor" opacity="0.6"/><line x1="24" y1="24" x2="24" y2="10" stroke="currentColor" stroke-width="0.8" opacity="0.5"/><line x1="24" y1="24" x2="35" y2="18" stroke="currentColor" stroke-width="0.8" opacity="0.5"/><line x1="24" y1="24" x2="35" y2="30" stroke="currentColor" stroke-width="0.8" opacity="0.5"/><line x1="24" y1="24" x2="24" y2="38" stroke="currentColor" stroke-width="0.8" opacity="0.5"/><line x1="24" y1="24" x2="13" y2="30" stroke="currentColor" stroke-width="0.8" opacity="0.5"/><line x1="24" y1="24" x2="13" y2="18" stroke="currentColor" stroke-width="0.8" opacity="0.5"/></svg>`,

  engineering: () => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" overflow="visible"><rect x="12" y="8" width="24" height="8" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.8"/><rect x="12" y="18" width="24" height="8" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="12" y="28" width="24" height="8" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><line x1="10" y1="12" x2="8" y2="12" stroke="currentColor" stroke-width="1.2"/><line x1="10" y1="22" x2="8" y2="22" stroke="currentColor" stroke-width="1.2"/><line x1="10" y1="32" x2="8" y2="32" stroke="currentColor" stroke-width="1.2"/></svg>`,

  evaluation: () => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" overflow="visible"><line x1="8" y1="24" x2="40" y2="24" stroke="currentColor" stroke-width="1.2"/><line x1="8" y1="20" x2="8" y2="28" stroke="currentColor" stroke-width="1"/><line x1="16" y1="21" x2="16" y2="27" stroke="currentColor" stroke-width="1"/><line x1="24" y1="20" x2="24" y2="28" stroke="currentColor" stroke-width="1.2"/><line x1="32" y1="21" x2="32" y2="27" stroke="currentColor" stroke-width="1"/><line x1="40" y1="20" x2="40" y2="28" stroke="currentColor" stroke-width="1"/><path d="M 18 34 L 21 37 L 30 28" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.6"/></svg>`,

  memory: () => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" overflow="visible"><circle cx="24" cy="24" r="3" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="24" cy="24" r="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.7"/><circle cx="24" cy="24" r="13" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.5"/><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.3"/><circle cx="24" cy="24" r="1.5" fill="currentColor"/></svg>`,

  safety: () => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" overflow="visible"><path d="M 24 8 L 16 12 L 16 24 Q 16 34 24 40 Q 32 34 32 24 L 32 12 Z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><rect x="20" y="22" width="8" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="0.9" opacity="0.7"/><circle cx="24" cy="26" r="1" fill="currentColor" opacity="0.7"/></svg>`,

  monitoring: () => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" overflow="visible"><ellipse cx="24" cy="18" rx="6" ry="5" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="24" cy="18" r="2.5" fill="currentColor" opacity="0.7"/><polyline points="8,30 12,30 14,26 16,34 18,30 24,30 28,28 30,30 40,30" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  governance: () => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" overflow="visible"><line x1="24" y1="10" x2="24" y2="16" stroke="currentColor" stroke-width="1.2"/><rect x="12" y="16" width="8" height="6" fill="none" stroke="currentColor" stroke-width="1"/><line x1="12" y1="16" x2="16" y2="10" stroke="currentColor" stroke-width="0.9"/><line x1="20" y1="16" x2="16" y2="10" stroke="currentColor" stroke-width="0.9"/><rect x="28" y="16" width="8" height="6" fill="none" stroke="currentColor" stroke-width="1"/><line x1="28" y1="16" x2="32" y2="10" stroke="currentColor" stroke-width="0.9"/><line x1="36" y1="16" x2="32" y2="10" stroke="currentColor" stroke-width="0.9"/><rect x="18" y="28" width="12" height="10" fill="none" stroke="currentColor" stroke-width="0.9"/><line x1="20" y1="33" x2="28" y2="33" stroke="currentColor" stroke-width="0.7"/></svg>`,

  advanced: () => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" overflow="visible"><path d="M 24 12 Q 32 12 32 20 Q 32 28 24 28 Q 16 28 16 20" fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.8"/><path d="M 24 16 Q 28 16 28 20 Q 28 24 24 24 Q 20 24 20 20" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="24" cy="20" r="2" fill="currentColor" opacity="0.6"/></svg>`,

  production: () => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" overflow="visible"><rect x="8" y="20" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1"/><rect x="20" y="20" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.1"/><rect x="32" y="20" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.6"/><line x1="16" y1="24" x2="20" y2="24" stroke="currentColor" stroke-width="0.9"/><line x1="28" y1="24" x2="32" y2="24" stroke="currentColor" stroke-width="0.9"/><path d="M 38 18 L 38 16 M 38 32 L 38 34" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/></svg>`,
};

// Helper to render inline icon HTML (for use in templates)
function iconHTML(guideKey, size = '24') {
  if (!GUIDE_ICONS[guideKey]) return '';
  const svgStr = GUIDE_ICONS[guideKey]();
  // Just add size and style attributes
  return svgStr.replace('viewBox="0 0 48 48"', `viewBox="0 0 48 48" width="${size}" height="${size}" style="display:inline-block;vertical-align:middle;margin-right:6px;color:inherit"`);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GUIDE_ICONS, iconHTML };
}
