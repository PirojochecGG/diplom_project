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

const drawerWidth = 260;

const items = [
  { label: "Dashboard", path: "/", icon: <DashboardOutlinedIcon /> },
  { label: "Incident Editor", path: "/incidents", icon: <DescriptionOutlinedIcon /> },
  { label: "IoC Review", path: "/review", icon: <HubOutlinedIcon /> },
  { label: "Feed Export", path: "/feeds", icon: <UploadFileOutlinedIcon /> },
  { label: "STIX Visualizer", path: "/stix-visualizer", icon: <InsightsOutlinedIcon /> },
];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "linear-gradient(180deg, #0a1220 0%, #07101b 100%)" }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, backdropFilter: "blur(10px)" }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
            background: "#0d1728",
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
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
              sx={{ mx: 1, borderRadius: 2 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { sm: `100px` } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
