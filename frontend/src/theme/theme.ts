import { createTheme } from "@mui/material";

export const appColors = {
  backgroundTop: "#1c201b",
  backgroundBottom: "#151914",
  surface: "#1c201b",
  surfaceElevated: "#252b24",
  surfaceMuted: "rgba(28, 32, 27, 0.86)",
  border: "rgba(246, 228, 0, 0.18)",
  borderStrong: "rgba(1, 191, 192, 0.48)",
  primary: "#f6e400",
  primarySoft: "rgba(246, 228, 0, 0.14)",
  primaryLine: "rgba(246, 228, 0, 0.52)",
  secondary: "#01bfc0",
  secondarySoft: "rgba(1, 191, 192, 0.14)",
  secondaryStrong: "rgba(1, 191, 192, 0.92)",
  darkShade: "#1c201b",
  text: "#f6e400",
  textMuted: "#01bfc0",
};

export const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: appColors.primary,
      contrastText: appColors.darkShade,
    },
    secondary: {
      main: appColors.secondary,
      contrastText: appColors.darkShade,
    },
    info: {
      main: appColors.secondary,
    },
    success: {
      main: appColors.secondary,
    },
    warning: {
      main: appColors.primary,
    },
    error: {
      main: "#ff6b5f",
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
    fontFamily: `"Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif`,
    h1: {
      fontFamily: `"Roboto Slab", Georgia, serif`,
      fontWeight: 900,
      letterSpacing: 0,
      color: appColors.primary,
    },
    h2: {
      fontFamily: `"Roboto Slab", Georgia, serif`,
      fontWeight: 900,
      letterSpacing: 0,
      color: appColors.primary,
    },
    h3: {
      fontFamily: `"Roboto Slab", Georgia, serif`,
      fontWeight: 900,
      letterSpacing: 0,
      color: appColors.primary,
    },
    h4: {
      fontFamily: `"Roboto Slab", Georgia, serif`,
      fontWeight: 900,
      letterSpacing: 0,
      color: appColors.primary,
    },
    h5: {
      fontFamily: `"Roboto Slab", Georgia, serif`,
      fontWeight: 800,
      letterSpacing: 0,
      color: appColors.primary,
    },
    h6: {
      fontFamily: `"Roboto Slab", Georgia, serif`,
      fontWeight: 800,
      letterSpacing: 0,
      color: appColors.primary,
    },
    button: {
      fontWeight: 700,
      letterSpacing: 0,
      textTransform: "uppercase",
    },
    overline: {
      fontWeight: 700,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"kern"',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        body1: {
          fontFamily: `"Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif`,
          fontWeight: 500,
        },
        body2: {
          fontFamily: `"Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif`,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${appColors.border}`,
          boxShadow: "0 18px 48px rgba(0, 0, 0, 0.28)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: `"Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif`,
          fontSize: "0.94rem",
          fontWeight: 700,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: appColors.secondary,
          fontFamily: `"Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif`,
          fontSize: "1rem",
          fontWeight: 700,
          "&.Mui-focused": {
            color: appColors.primary,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: appColors.primary,
          fontFamily: `"Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif`,
          fontSize: "1rem",
          fontWeight: 500,
        },
        input: {
          "&::placeholder": {
            color: appColors.secondary,
            fontFamily: `"Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif`,
            fontStyle: "italic",
            fontWeight: 500,
            opacity: 0.82,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(21, 25, 20, 0.72)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: appColors.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: appColors.secondary,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: appColors.primary,
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: appColors.primary,
          fontFamily: `"Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif`,
          fontSize: "1rem",
          fontWeight: 600,
          "&.Mui-selected": {
            backgroundColor: appColors.secondarySoft,
          },
          "&.Mui-selected:hover": {
            backgroundColor: "rgba(1, 191, 192, 0.22)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${appColors.border}`,
          color: appColors.secondary,
          fontFamily: `"Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif`,
          fontSize: "0.98rem",
          fontWeight: 500,
        },
        head: {
          backgroundColor: appColors.surfaceElevated,
          color: appColors.primary,
          fontFamily: `"Roboto Slab", Georgia, serif`,
          fontSize: "0.92rem",
          fontWeight: 800,
          textTransform: "uppercase",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover td": {
            backgroundColor: "rgba(1, 191, 192, 0.06)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderColor: appColors.borderStrong,
          color: appColors.primary,
          fontFamily: `"Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif`,
          fontWeight: 700,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          color: appColors.secondary,
          fontFamily: `"Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif`,
          fontWeight: 500,
        },
        message: {
          fontFamily: `"Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif`,
        },
        standardInfo: {
          backgroundColor: appColors.surfaceMuted,
          border: `1px solid ${appColors.borderStrong}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          color: appColors.text,
          borderBottom: `1px solid ${appColors.border}`,
          backgroundColor: "rgba(28, 32, 27, 0.82)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${appColors.border}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: appColors.text,
          "& .MuiListItemIcon-root": {
            color: appColors.secondary,
          },
          "&.Mui-selected": {
            backgroundColor: appColors.secondarySoft,
            color: appColors.primary,
            "& .MuiListItemIcon-root": {
              color: appColors.primary,
            },
          },
          "&.Mui-selected:hover": {
            backgroundColor: "rgba(1, 191, 192, 0.22)",
          },
        },
      },
    },
  },
});
