import { MD3LightTheme, configureFonts } from "react-native-paper";

const fontConfig = {
  fontFamily: "System"
};

export const PeanutTheme = {
  ...MD3LightTheme,
  roundness: 16,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: "#7C6FF9",
    secondary: "#1FC8A8",
    tertiary: "#94A3B8",
    surfaceVariant: "#F1F5F9",
    background: "#F5F4FA",
    surface: "#FFFFFF",
    error: "#EF4444",
    onPrimary: "#FFFFFF",
    onSecondary: "#07332B",
    outline: "#E2E8F0",
    outlineVariant: "#CBD5E1"
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};
