// src/utils/theme.js
// Cinematic dark theme with neon blue accents

export const COLORS = {
  // Backgrounds
  bg: '#0a0f1a',
  bgCard: 'rgba(15, 25, 45, 0.85)',
  bgCardBorder: 'rgba(0, 180, 255, 0.15)',
  bgInput: 'rgba(10, 20, 40, 0.9)',
  bgOverlay: 'rgba(0, 0, 0, 0.6)',

  // Neon blues
  neonBlue: '#00b4ff',
  neonBlueDim: 'rgba(0, 180, 255, 0.6)',
  neonBlueGlow: 'rgba(0, 180, 255, 0.25)',
  neonBlueFaint: 'rgba(0, 180, 255, 0.08)',

  // Accents
  neonPurple: '#7b2fff',
  neonMint: '#00ffcc',
  neonGold: '#ffcc00',
  neonRed: '#ff3c6e',

  // Text
  textPrimary: '#e8f4ff',
  textSecondary: 'rgba(180, 215, 255, 0.65)',
  textMuted: 'rgba(120, 160, 200, 0.45)',

  // Status
  success: '#00ffcc',
  error: '#ff3c6e',
  warning: '#ffcc00',
};

export const CATEGORY_COLORS = {
  Lucid:    { bg: 'rgba(0, 180, 255, 0.15)',  border: '#00b4ff',  text: '#00b4ff'  },
  Nightmare:{ bg: 'rgba(255, 60, 110, 0.15)', border: '#ff3c6e',  text: '#ff3c6e'  },
  Recurring:{ bg: 'rgba(123, 47, 255, 0.15)', border: '#7b2fff',  text: '#9b6fff'  },
  Vivid:    { bg: 'rgba(0, 255, 204, 0.12)',  border: '#00ffcc',  text: '#00ffcc'  },
  Prophetic:{ bg: 'rgba(255, 204, 0, 0.12)',  border: '#ffcc00',  text: '#ffcc00'  },
  Other:    { bg: 'rgba(120, 160, 200, 0.12)',border: 'rgba(120,160,200,0.4)', text: 'rgba(180,215,255,0.7)' },
};

export const CATEGORIES = Object.keys(CATEGORY_COLORS);

export const FONTS = {
  // Use system fonts that ship with React Native — no extra install needed
  display: 'serif',       // elegant, editorial feel
  body: 'sans-serif',
  mono: 'monospace',
};

export const SHADOWS = {
  neonGlow: {
    shadowColor: '#00b4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 12,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
};
