import {
  Avatar,
  AvatarGroup,
  Button,
  IconButton,
  Chip,
  Stack,
  Typography,
} from "@mui/joy";
import * as React from "react";

import { ArrowBackIosNewRounded } from "@mui/icons-material";

import { UserProps } from "../properties/types";
import { toggleMessagesPane } from "../utils/utils";
import HandymanTwoToneIcon from "@mui/icons-material/HandymanTwoTone";
import { Profile } from "./CoworkerProfile";

type CoworkerChatHeaderProps = {
  sender: UserProps[];
};
const create_chip = (tool_name: Array<string>) => (
  <>
    <Chip
      variant="outlined"
      color="success"
      endDecorator={<HandymanTwoToneIcon />}
      sx={{
        "--Chip-radius": "5px",
      }}
    >
      Tools
    </Chip>
    {tool_name.map((tool, key) => (
      <Typography key={key}>{tool}</Typography>
    ))}
  </>
);
const chips = (sender_name: string) => {
  const all_tools = ["Calculator", "Coder", "WebSearch", "Web Scrapping"];
  const plutus_tools = ["Calculator", "Coder"];
  const neil_tools = ["WebSearch", "Web Scrapping"];
  if (sender_name === "Plutus") {
    return create_chip(plutus_tools);
  }
  if (sender_name === "Neil") {
    return create_chip(neil_tools);
  }
  return create_chip(all_tools);
};

export const CoworkerChatHeader = (props: CoworkerChatHeaderProps) => {
  const { sender } = props;
  const [openProfile, setOpenProfile] = React.useState<boolean>(false);
  const toggleProfile = () => {
    setOpenProfile((p) => !p);
  };

  const sender_name = sender
    .map((s) => {
      return s.name;
    })
    .join(", ");

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.body",
        }}
        py={{ xs: 2, md: 2 }}
        px={{ xs: 1, md: 2 }}
      >
        <Stack direction="row" spacing={{ xs: 1, md: 2 }} alignItems="center">
          <IconButton
            variant="plain"
            color="neutral"
            size="sm"
            sx={{
              display: { xs: "inline-flex", sm: "none" },
            }}
            onClick={() => toggleMessagesPane()}
          >
            <ArrowBackIosNewRounded />
          </IconButton>
          <AvatarGroup>
            {sender.map((s, k) => {
              return <Avatar key={k} size="lg" src={s.avatar} />;
            })}
          </AvatarGroup>
          <div>
            <Stack direction="row" gap={2}>
              <Typography fontWeight="lg" fontSize="lg" component="h2" noWrap>
                {sender_name}
              </Typography>
              <>{chips(sender_name)}</>
            </Stack>
          </div>
        </Stack>
        <Stack spacing={1} direction="row" alignItems="center">
          <Button
            color="neutral"
            variant="outlined"
            size="sm"
            sx={{
              display: { xs: "none", md: "inline-flex" },
            }}
            onClick={() => toggleProfile()}
          >
            View profile
          </Button>
        </Stack>
      </Stack>
      <Profile
        openProfile={openProfile}
        toggleProfile={toggleProfile}
        sender={sender}
      />
    </>
  );
};
