/**
 * HR System Design Theme
 * Warm, cozy color palette with orange/peach undertones
 */

export const theme = {
  colors: {
    // Backgrounds - Warm whites with yellow/orange undertones
    background: {
      primary: '#fef9f3',
      secondary: '#fff8ee',
      card: '#ffffff',
    },
    
    // Primary - Terracotta orange
    primary: {
      main: '#e76f51',
      light: '#f4a261',
      dark: '#d62828',
      hover: '#d45a3f',
    },
    
    // Accent - Teal green
    accent: {
      main: '#2a9d8f',
      light: '#4ecdc4',
      dark: '#1a6b5f',
      hover: '#238a7d',
    },
    
    // Success - Warm green
    success: {
      main: '#8ac926',
      light: '#a8e063',
      dark: '#6a9a1a',
    },
    
    // Warning - Golden orange
    warning: {
      main: '#ff9f1c',
      light: '#ffb84d',
      dark: '#cc7f16',
    },
    
    // Error
    error: {
      main: '#e63946',
      light: '#f77f7f',
      dark: '#b82e3a',
    },
    
    // Borders - Light warm gray
    border: {
      main: '#e2dcd0',
      light: '#f0ebe5',
      dark: '#d4ccc0',
    },
    
    // Text - Dark charcoal with warm undertones
    text: {
      primary: '#2d2d2d',
      secondary: '#5a5a5a',
      tertiary: '#8a8a8a',
      inverse: '#ffffff',
    },
    
    // Gradients
    gradients: {
      orangePeach: 'linear-gradient(135deg, #e76f51 0%, #f4a261 100%)',
      tealAccent: 'linear-gradient(135deg, #2a9d8f 0%, #4ecdc4 100%)',
      warmBackground: 'linear-gradient(180deg, #fef9f3 0%, #fff8ee 100%)',
    },
  },
  
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '1rem',      // 16px - Primary radius for cozy design
    xl: '1.5rem',    // 24px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(231, 111, 81, 0.05)',
    md: '0 4px 6px -1px rgba(231, 111, 81, 0.1), 0 2px 4px -1px rgba(231, 111, 81, 0.06)',
    lg: '0 10px 15px -3px rgba(231, 111, 81, 0.1), 0 4px 6px -2px rgba(231, 111, 81, 0.05)',
    xl: '0 20px 25px -5px rgba(231, 111, 81, 0.1), 0 10px 10px -5px rgba(231, 111, 81, 0.04)',
    // Warm orange-tinted shadows
    warm: '0 4px 14px 0 rgba(231, 111, 81, 0.15)',
  },
  
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

export type Theme = typeof theme;

