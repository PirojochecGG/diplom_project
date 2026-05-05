import { createTheme } from "@mui/material";

export const appColors = {
  backgroundTop: "#151712",
  backgroundBottom: "#0c0f0d",
  surface: "#181c17",
  surfaceElevated: "#20251e",
  surfaceMuted: "rgba(28, 33, 27, 0.86)",
  border: "rgba(156, 180, 151, 0.18)",
  borderStrong: "rgba(68, 181, 151, 0.32)",
  primary: "#44b597",
  primarySoft: "rgba(68, 181, 151, 0.14)",
  primaryLine: "rgba(68, 181, 151, 0.38)",
  secondary: "#d8a03d",
  secondaryStrong: "rgba(216, 160, 61, 0.9)",
  text: "#f3f5ef",
  textMuted: "#aeb8a8",
};

export const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: appColors.primary,
      contrastText: "#06110d",
    },
    secondary: {
      main: appColors.secondary,
      contrastText: "#171006",
    },
    info: {
      main: appColors.primary,
    },
    success: {
      main: "#63c174",
    },
    warning: {
      main: appColors.secondary,
    },
    error: {
      main: "#e06f64",
    },
    background: {
      default: appColors.backgroundBottom,
      paper: appColors.surface,
    },
    text: {
      primary: appColors.text,
      secondary: appColors.textMuted,
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: `"Segoe UI", "Helvetica Neue", sans-serif`,
    h4: {
      fontWeight: 700,
      letterSpacing: 0,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${appColors.border}`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardInfo: {
          backgroundColor: appColors.primarySoft,
          border: `1px solid ${appColors.borderStrong}`,
        },
      },
    },
  },
});
