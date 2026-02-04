// Fullport Design System - Liquid Glass Theme
// iOS 18 aesthetic with dark mode and glass morphism

export const colors = {
  // Background
  bgPrimary: 'rgb(0, 0, 0)',
  bgSecondary: 'rgb(15, 15, 20)',
  bgTertiary: 'rgb(25, 25, 32)',

  // Glass Effect
  glassBg: 'rgba(255, 255, 255, 0.08)',
  glassBgHover: 'rgba(255, 255, 255, 0.12)',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  glassBorderHover: 'rgba(255, 255, 255, 0.25)',

  // Text
  textPrimary: 'rgb(255, 255, 255)',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',

  // Accent Colors
  accentGreen: '#4ade80', // Gains
  accentRed: '#f87171', // Losses
  accentBlue: '#60a5fa', // Links/Info
  accentPurple: '#a855f7', // SKR branding
  accentGold: '#fcd34d', // Premium/Highlight

  // Solana
  solana: '#9945FF',
  solanaGradientStart: '#9945FF',
  solanaGradientEnd: '#14F195',

  // Tab Bar
  tabBarBg: 'rgba(15, 15, 20, 0.95)',
  tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  tabActive: '#ffffff',
  tabInactive: 'rgba(255, 255, 255, 0.5)',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
}

export const typography = {
  // Display (large numbers, portfolio value)
  displayLarge: {
    fontSize: 48,
    fontWeight: '700' as const,
    letterSpacing: -1,
    lineHeight: 56,
  },
  displayMedium: {
    fontSize: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 44,
  },

  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 24,
  },

  // Body
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 18,
  },

  // Labels
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 14,
  },

  // Monospace (for numbers, addresses)
  mono: {
    fontSize: 14,
    fontWeight: '500' as const,
    fontFamily: 'monospace',
    letterSpacing: 0,
    lineHeight: 20,
  },
}

// Animation timing (for Reanimated)
export const animation = {
  // Smooth ease for opacity, color
  smoothEase: {
    duration: 250,
  },
  // Bounce ease for transforms
  bounceEase: {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
  },
  // Stagger delay for lists
  staggerDelay: 30,
}

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  }),
}
