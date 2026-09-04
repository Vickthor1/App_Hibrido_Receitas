// Paleta warm_culinary — DESIGN.md
export const cores = {
  // Brand
  primary: "#ab3500", // Paprika Orange — mobile (protótipo)
  primaryDesktop: "#832600", // desktop variant
  onPrimary: "#ffffff",
  primaryContainer: "#ff6b35", // Terracotta
  onPrimaryContainer: "#5f1900",
  primaryFixed: "#ffdbd0",
  primaryFixedDim: "#ffb59d",
  onPrimaryFixed: "#390c00",
  onPrimaryFixedVariant: "#832600",

  // Background / Surface
  background: "#f8f9ff",
  onBackground: "#151c26",
  surface: "#f8f9ff",
  onSurface: "#151c26",
  onSurfaceVariant: "#594139",
  surfaceVariant: "#dce3f2",
  surfaceDim: "#d3dae9",
  surfaceBright: "#f8f9ff",
  surfaceContainer: "#e7eefd",
  surfaceContainerLow: "#eff3ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerHigh: "#e2e8f7",
  surfaceContainerHighest: "#dce3f2",
  surfaceTint: "#ab3500",

  // Secondary / Tertiary
  secondary: "#5d5e61",
  onSecondary: "#ffffff",
  secondaryContainer: "#e0dfe3",
  onSecondaryContainer: "#616265",
  secondaryFixed: "#e2e2e5",
  secondaryFixedDim: "#c6c6c9",
  onSecondaryFixed: "#1a1c1e",
  onSecondaryFixedVariant: "#45474a",
  tertiary: "#444748",
  onTertiary: "#ffffff",
  tertiaryContainer: "#5c5f60",
  onTertiaryContainer: "#d7d9da",
  tertiaryFixed: "#e1e3e4",
  tertiaryFixedDim: "#c5c7c8",
  onTertiaryFixed: "#191c1d",
  onTertiaryFixedVariant: "#444748",

  // Outline / Error
  outline: "#8d7168",
  outlineVariant: "#e1bfb5",
  outlineWarm: "#8d7168",
  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",

  // Inverse
  inverseSurface: "#2a313c",
  inverseOnSurface: "#ebf1ff",
  inversePrimary: "#ffb59d",

  // Accent
  star: "#FFB02E",
  warmSurface: "#f8f9ff",
} as const;

export type Cores = typeof cores;
