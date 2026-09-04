// Paleta Dark Editorial — Gótico Vitoriano (sóbrio, não gamer)
// Preto/quase preto para fundos, off-white para textos, vermelho escuro como accent
export const cores = {
  // Brand - dark
  primary: "#8B0000", // dark red accent (não dominante)
  primaryHover: "#6B0000",
  onPrimary: "#F5F1E8",
  primaryContainer: "#1A1A1A",
  onPrimaryContainer: "#F5F1E8",
  primaryFixed: "#2A0A0A",
  primaryFixedDim: "#5A1A1A",
  onPrimaryFixed: "#F5F1E8",
  onPrimaryFixedVariant: "#8B0000",

  // Background / Surface — dark editorial
  background: "#0A0A0A",
  onBackground: "#F5F1E8",
  surface: "#111111",
  onSurface: "#F5F1E8",
  onSurfaceVariant: "#A0A0A0",
  surfaceVariant: "#2A2A2A",
  surfaceDim: "#0F0F0F",
  surfaceBright: "#1A1A1A",
  surfaceContainer: "#1E1E1E",
  surfaceContainerLow: "#161616",
  surfaceContainerLowest: "#111111",
  surfaceContainerHigh: "#252525",
  surfaceContainerHighest: "#2E2E2E",
  surfaceTint: "#8B0000",

  // Secondary / Tertiary — cinzas desaturados
  secondary: "#6B6B6B",
  onSecondary: "#F5F1E8",
  secondaryContainer: "#2A2A2A",
  onSecondaryContainer: "#D0D0D0",
  secondaryFixed: "#333333",
  secondaryFixedDim: "#4A4A4A",
  onSecondaryFixed: "#F5F1E8",
  onSecondaryFixedVariant: "#9A9A9A",
  tertiary: "#4A4A4A",
  onTertiary: "#F5F1E8",
  tertiaryContainer: "#222222",
  onTertiaryContainer: "#C0C0C0",
  tertiaryFixed: "#2A2A2A",
  tertiaryFixedDim: "#3A3A3A",
  onTertiaryFixed: "#F5F1E8",
  onTertiaryFixedVariant: "#8A8A8A",

  // Outline / Error
  outline: "#3A3A3A",
  outlineVariant: "#2A2A2A",
  outlineWarm: "#3A3A3A",
  error: "#8B0000",
  onError: "#F5F1E8",
  errorContainer: "#2A0A0A",
  onErrorContainer: "#FF8A80",

  // Inverse
  inverseSurface: "#F5F1E8",
  inverseOnSurface: "#0A0A0A",
  inversePrimary: "#8B0000",

  // Accent
  star: "#C9A86A", // dourado muted, não amarelo neon
  warmSurface: "#0A0A0A",
} as const;

export type Cores = typeof cores;
