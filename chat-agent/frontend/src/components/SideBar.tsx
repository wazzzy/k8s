import {
  Avatar,
  Box,
  Button,
  Divider,
  GlobalStyles,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  listItemButtonClasses,
  Typography,
  Sheet,
} from "@mui/joy";

import {
  SettingsRounded,
  LoginRounded,
  LogoutRounded,
} from "@mui/icons-material";

import { Link, useNavigate } from "react-router-dom";

import { Theme } from "./Theme";
import { NavBar } from "./NavBar";
import { UserGlobalContext } from "../App";
import { closeSidebar } from "../utils/utils";

export const SideBar = () => {
  const navigate = useNavigate();
  const { user, setUser } = UserGlobalContext();

  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: "fixed", md: "sticky" },
        transform: {
          xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))",
          md: "none",
        },
        transition: "transform 0.4s, width 0.4s",
        zIndex: 1000,
        height: "100dvh",
        width: "var(--Sidebar-width)",
        top: 0,
        p: 2,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ":root": {
            "--Sidebar-width": "220px",
            [theme.breakpoints.up("lg")]: {
              "--Sidebar-width": "240px",
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: "fixed",
          zIndex: 9998,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          opacity: "var(--SideNavigation-slideIn)",
          backgroundColor: "var(--joy-palette-background-backdrop)",
          transition: "opacity 0.4s",
          transform: {
            xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))",
            lg: "translateX(-100%)",
          },
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Typography level="title-lg">E42</Typography>
        <Theme sx={{ ml: "auto" }} />
      </Box>
      <Box
        sx={{
          minHeight: 0,
          overflow: "hidden auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        <NavBar user={user} />
        <List
          size="sm"
          sx={{
            mt: "auto",
            flexGrow: 0,
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
            "--List-gap": "8px",
          }}
        >
          <ListItem>
            <ListItemButton>
              <SettingsRounded />
              Settings
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <Divider />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        {user ? (
          <>
            <Avatar variant="outlined" size="sm">
              {user.name.substring(0, 2).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
              <Typography level="title-sm">{user.name}</Typography>
              <Typography level="body-xs">{user.email}</Typography>
            </Box>
            <IconButton size="sm" variant="plain" color="neutral">
              <LogoutRounded
                onClick={() => {
                  localStorage.removeItem("login");
                  setUser(null);
                  navigate("/");
                }}
              />
            </IconButton>
          </>
        ) : (
          <Button
            color="neutral"
            variant="plain"
            startDecorator={<LoginRounded />}
            component={Link}
            to="/signin"
          >
            Sign-in
          </Button>
        )}
      </Box>
    </Sheet>
  );
};
