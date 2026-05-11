import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { appColors } from "../theme/theme";

const drawerWidth = 260;

const items = [
  { label: "Dashboard", path: "/", icon: <DashboardOutlinedIcon /> },
  {
    label: "Incident Editor",
    path: "/incidents",
    icon: <DescriptionOutlinedIcon />,
  },
  { label: "IoC Review", path: "/review", icon: <HubOutlinedIcon /> },
  { label: "Feed Export", path: "/feeds", icon: <UploadFileOutlinedIcon /> },
  {
    label: "STIX Visualizer",
    path: "/stix-visualizer",
    icon: <InsightsOutlinedIcon />,
  },
];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        maxWidth: "100vw",
        overflowX: "hidden",
        background: `linear-gradient(180deg, ${appColors.backgroundTop} 0%, ${appColors.backgroundBottom} 100%)`,
      }}
    >
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              color: appColors.secondary,
              fontFamily: `"Lobster", cursive`,
              fontSize: "1.7rem",
              fontWeight: 400,
            }}
          >
            CTI IoC Feed Prototype
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            background: appColors.surface,
          },
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              color: appColors.secondary,
              fontFamily: `"Lobster", cursive`,
              fontSize: "1.9rem",
              fontWeight: 400,
            }}
          >
            Cyber Threat Intel
          </Typography>
        </Toolbar>
        <List>
          {items.map((item) => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{ mx: 1, borderRadius: 1 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          p: 3,
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
