/** @fileoverview Explicit configuration boundary for portfolio-only demo data. */

export const isDemoModeEnabled = (
  configuredValue: string | undefined = process.env.EXPO_PUBLIC_DEMO_MODE,
): boolean => configuredValue?.trim().toLowerCase() === 'true';
