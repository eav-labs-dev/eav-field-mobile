/**
 * @fileoverview Design tokens shared across the EAV Field mobile interface.
 */

export const colors = {
  background: '#F4F7F5',
  surface: '#FFFFFF',
  surfaceMuted: '#E9F1EC',
  primary: '#174D38',
  primaryStrong: '#0D3626',
  accent: '#D9A441',
  text: '#17211C',
  textMuted: '#66736C',
  border: '#D8E0DB',
  success: '#267A52',
  warning: '#A86D11',
  danger: '#A43D3D',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
} as const;
