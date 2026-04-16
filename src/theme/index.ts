/**
 * GreenTechCycle corporate dark theme
 * Matches the web platform at charlie-five.vercel.app
 */
export const theme = {
  colors: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceLight: '#334155',
    border: '#475569',
    primary: '#3B82F6',
    secondary: '#6366F1',
    success: '#059669',
    error: '#DC2626',
    warning: '#F59E0B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    white: '#FFFFFF',
    black: '#000000',
    inputBackground: '#1E293B',
    cardBackground: '#1E293B',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    title: 34,
  },
} as const;

export type Theme = typeof theme;
