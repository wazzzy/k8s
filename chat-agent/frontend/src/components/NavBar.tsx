import {
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  Typography,
} from "@mui/joy";

import * as React from "react";
import { styled } from "@mui/system";
import { UserProps } from "../properties/types";
import { Link, useLocation } from "react-router-dom";
import { HomeRounded, QuestionAnswerRounded } from "@mui/icons-material";

export interface NavBarProps {
  user: UserProps | null;
}

export const NavBar = (props: NavBarProps) => {
  const { user } = props;
  let location = useLocation();
  const [current, setCurrent] = React.useState(
    location.pathname === "/" || location.pathname === ""
      ? "/"
      : location.pathname,
  );

  React.useEffect(() => {
    if (location) {
      if (current !== location.pathname) {
        setCurrent(location.pathname);
      }
    }
  }, [location, current]);

  function handleClick(e: any) {
    setCurrent(e.key);
  }

  const UnStyledLink = styled(Link)`
    text-decoration: none;
    &:focus,
    &:hover,
    &:visited,
    &:link,
    &:active {
      text-decoration: none;
    }
  `;
  console.log("current", current);

  return (
    <List
      size="sm"
      sx={{
        gap: 1,
        "--List-nestedInsetStart": "30px",
        "--ListItem-radius": (theme) => theme.vars.radius.sm,
      }}
      onClick={handleClick}
    >
      <ListItem key="/">
        <ListItemButton
          selected={current === "/"}
          component={UnStyledLink}
          to="/"
        >
          <HomeRounded />
          <ListItemContent>
            <Typography level="title-sm">Home</Typography>
          </ListItemContent>
        </ListItemButton>
      </ListItem>
      {user && (
        <ListItem key="/coworkers">
          <ListItemButton
            selected={current !== undefined && current.startsWith("/coworkers")}
            component={UnStyledLink}
            to="coworkers"
          >
            <QuestionAnswerRounded />
            <ListItemContent>
              <Typography level="title-sm">Co-Workers</Typography>
            </ListItemContent>
          </ListItemButton>
        </ListItem>
      )}
    </List>
  );
};
