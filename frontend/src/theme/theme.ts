import { createTheme } from "@mui/material";

export const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7dd3fc",
    },
    secondary: {
      main: "#f59e0b",
    },
    background: {
      default: "#09111f",
      paper: "#101a2b",
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: `"Segoe UI", "Helvetica Neue", sans-serif`,
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.03em",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(125, 211, 252, 0.08)",
        },
      },
    },
  },
});
