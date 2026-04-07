import { MD3LightTheme, configureFonts } from "react-native-paper";

// Font families — loaded in app/_layout.tsx via expo-font
export const fonts = {
  heading: "PlusJakartaSans_700Bold",
  headingMedium: "PlusJakartaSans_600SemiBold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
};

const fontConfig = {
  fontFamily: fonts.body,
} as const;

// Peanut Design System — sourced from cristobal2323/Peanutappdesign (Figma Make export)
// Primary accent: #F59E42 (peanut orange)
export const colors = {
  // ── Primary (Peanut Orange) ──
  primary: "#F59E42",
  primaryContainer: "#FFF4E6",
  primaryFixed: "#FFE9D1",
  primaryFixedDim: "#E58D31",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#7A4A10",

  // ── Secondary (Blue — "found" / map / info) ──
  secondary: "#3B82F6",
  secondaryContainer: "rgba(59,130,246,0.10)",
  secondaryFixed: "rgba(59,130,246,0.20)",
  onSecondary: "#ffffff",
  onSecondaryContainer: "#1E3A8A",

  // ── Tertiary (Green — "safe" / success) ──
  tertiary: "#10B981",
  tertiaryContainer: "rgba(16,185,129,0.10)",
  tertiaryFixed: "rgba(16,185,129,0.20)",
  onTertiary: "#ffffff",
  onTertiaryContainer: "#065F46",

  // ── Error (Red — "lost" / destructive) ──
  error: "#EF4444",
  errorContainer: "rgba(239,68,68,0.06)",
  onError: "#ffffff",
  onErrorContainer: "#7F1D1D",

  // ── Surfaces ──
  background: "#FAFAFA",
  onBackground: "#030213",

  surface: "#FAFAFA",
  surfaceBright: "#ffffff",
  surfaceDim: "#f0f0f3",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f3f3f5",
  surfaceContainer: "#ececf0",
  surfaceContainerHigh: "#e9ebef",
  surfaceContainerHighest: "#e1e3e8",
  surfaceVariant: "#f3f3f5",

  // ── Text ──
  onSurface: "#030213",
  onSurfaceVariant: "#717182",
  surfaceTint: "#F59E42",

  // ── Outlines ──
  outline: "rgba(0,0,0,0.10)",
  outlineVariant: "rgba(0,0,0,0.06)",

  // ── Inverse ──
  inverseSurface: "#1f1f23",
  inverseOnSurface: "#FAFAFA",
  inversePrimary: "#FFE9D1",

  // ── Semantic aliases (legacy compatibility) ──
  textPrimary: "#030213",
  textSecondary: "#3F3F46",
  textMuted: "#717182",
  cardBackground: "#ffffff",
  ghostBorder: "rgba(0,0,0,0.06)",

  // ── Extra accents (for status badges, banners) ──
  accentPurple: "#8B5CF6",
  accentPurpleContainer: "rgba(139,92,246,0.10)",
  accentBlue: "#3B82F6",
  accentBlueContainer: "rgba(59,130,246,0.10)",
  accentGreen: "#10B981",
  accentGreenContainer: "rgba(16,185,129,0.10)",
  accentAmber: "#F59E0B",
  accentAmberContainer: "rgba(245,158,11,0.10)",
};

export const PeanutTheme = {
  ...MD3LightTheme,
  roundness: 14,
  fonts: configureFonts({ config: { fontFamily: fonts.body } }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryContainer,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryContainer,
    tertiary: colors.tertiary,
    tertiaryContainer: colors.tertiaryContainer,
    error: colors.error,
    errorContainer: colors.errorContainer,
    background: colors.background,
    surface: colors.surfaceContainerLowest,
    surfaceVariant: colors.surfaceVariant,
    onPrimary: colors.onPrimary,
    onSecondary: colors.onSecondary,
    onTertiary: colors.onTertiary,
    onSurface: colors.onSurface,
    onSurfaceVariant: colors.onSurfaceVariant,
    onError: colors.onError,
    onErrorContainer: colors.onErrorContainer,
    onBackground: colors.onBackground,
    outline: colors.outline,
    outlineVariant: colors.outlineVariant,
    inverseSurface: colors.inverseSurface,
    inverseOnSurface: colors.inverseOnSurface,
    inversePrimary: colors.inversePrimary,
    surfaceDisabled: colors.surfaceContainerHigh,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: colors.surface,
      level1: colors.surfaceContainerLow,
      level2: colors.surfaceContainer,
      level3: colors.surfaceContainerHigh,
      level4: colors.surfaceContainerHigh,
      level5: colors.surfaceContainerHighest,
    },
  },
};

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
};

// Corner radius tokens
export const radii = {
  sm: 8,
  md: 14,        // base — design uses rounded-[14px] on inputs/buttons
  inputFocus: 14,
  lg: 20,        // section cards
  xl: 24,        // primary cards
  xxl: 32,       // hero/biometric cards
  full: 9999,    // pills, buttons
};

// Ambient shadow preset
export const ambientShadow = {
  shadowColor: "#030213",
  shadowOpacity: 0.06,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 12 },
  elevation: 2,
};

export const cardShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};
