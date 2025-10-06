export const COSUMAR_COLORS = {
  primary: '#003366',
  secondary: '#009933',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  gray: '#CCCCCC',
  darkGray: '#666666',
  black: '#000000',
  success: '#009933',
  error: '#DC3545',
  warning: '#FFC107',
} as const;

export default {
  light: {
    text: COSUMAR_COLORS.black,
    background: COSUMAR_COLORS.white,
    tint: COSUMAR_COLORS.primary,
    tabIconDefault: COSUMAR_COLORS.gray,
    tabIconSelected: COSUMAR_COLORS.primary,
    primary: COSUMAR_COLORS.primary,
    secondary: COSUMAR_COLORS.secondary,
  },
};
