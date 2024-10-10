import {
  AvatarGroup,
  Box,
  ListDivider,
  ListItem,
  ListItemButton,
  ListItemButtonProps,
  Stack,
  Typography,
} from "@mui/joy";

import * as React from "react";
import { useNavigate } from "react-router-dom";

import { UserAvatar } from "./UserAvatar";
import {
  CoworkerChatProps,
  MessageProps,
  UserProps,
} from "../properties/types";

type CoworkerListProps = ListItemButtonProps & {
  id: string;
  unread?: boolean;
  sender: UserProps[];
  messages: MessageProps[];
  coworker_chat: CoworkerChatProps;
  selCoworkersId?: string;
};

export const CoworkerList = (props: CoworkerListProps) => {
  let navigate = useNavigate();
  const { id, sender, messages, selCoworkersId } = props;
  const selected = selCoworkersId === id;
  const names = sender
    .map((e) => {
      return e.name;
    })
    .join(", ");

  return (
    <React.Fragment>
      <ListItem>
        <ListItemButton
          onClick={() => {
            navigate(`/coworkers/${id}`);
          }}
          selected={selected}
          color="neutral"
          sx={{
            flexDirection: "column",
            alignItems: "initial",
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={1.5}>
            <AvatarGroup>
              {sender.map((e, k) => {
                return <UserAvatar key={k} src={e.avatar} />;
              })}
            </AvatarGroup>
            <Box sx={{ flex: 1 }}>
              <Typography level="title-sm">{names}</Typography>
            </Box>
          </Stack>
          <Typography
            level="body-sm"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: "2",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {messages[0]?.content}
          </Typography>
        </ListItemButton>
      </ListItem>
      <ListDivider sx={{ margin: 0 }} />
    </React.Fragment>
  );
};
