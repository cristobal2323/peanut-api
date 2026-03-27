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

// Editorial Biometrics — Design System Colors
// Source: DESIGN.md / Stitch Project "Peanut MVP"
export const colors = {
  primary: "#a23f00",
  primaryContainer: "#fa7025",
  primaryFixed: "#ffdbcd",
  primaryFixedDim: "#ffb595",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#591f00",

  secondary: "#2d6482",
  secondaryContainer: "#a7dbfe",
  secondaryFixed: "#c6e7ff",
  onSecondary: "#ffffff",
  onSecondaryContainer: "#29617f",

  tertiary: "#006d3f",
  tertiaryContainer: "#3eac70",
  tertiaryFixed: "#8cf8b5",
  onTertiary: "#ffffff",
  onTertiaryContainer: "#00391f",

  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  onError: "#ffffff",
  onErrorContainer: "#93000a",

  background: "#fff8ef",
  onBackground: "#1e1b13",

  surface: "#fff8ef",
  surfaceBright: "#fff8ef",
  surfaceDim: "#e1d9cb",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#fbf3e4",
  surfaceContainer: "#f5edde",
  surfaceContainerHigh: "#efe7d9",
  surfaceContainerHighest: "#e9e2d3",
  surfaceVariant: "#e9e2d3",
  onSurface: "#1e1b13",
  onSurfaceVariant: "#564337",
  surfaceTint: "#a23f00",

  outline: "#897365",
  outlineVariant: "#dcc1b1",

  inverseSurface: "#343026",
  inverseOnSurface: "#f8f0e1",
  inversePrimary: "#ffb595",

  // Semantic aliases
  textPrimary: "#1e1b13",
  textSecondary: "#564337",
  textMuted: "#897365",
  cardBackground: "#ffffff",
  ghostBorder: "rgba(220, 193, 177, 0.20)",
};

export const PeanutTheme = {
  ...MD3LightTheme,
  roundness: 24,
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

// Spacing scale (factor 3 — spacious)
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
  md: 16,     // ~1rem — min for inputs/small containers
  lg: 20,     // ~1.25rem — list capsules
  xl: 28,     // ~1.75rem — primary cards
  xxl: 36,    // ~2.25rem — biometric cards
  full: 9999, // pills, buttons
};

// Ambient shadow preset (Editorial Biometrics spec)
export const ambientShadow = {
  shadowColor: "#1e1b13",
  shadowOpacity: 0.06,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 12 },
  elevation: 2,
};
