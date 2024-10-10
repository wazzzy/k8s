import {
  CelebrationOutlined,
  FavoriteBorder,
  InsertDriveFileRounded,
} from "@mui/icons-material";

import * as React from "react";
import Moment from "react-moment";
import { Markdown } from "./Markdown";
import { Avatar, Box, IconButton, Sheet, Stack, Typography } from "@mui/joy";

import { MessageProps, UserProps } from "../properties/types";
import { Tool } from "./Tool";

type ChatBubbleProps = MessageProps & {
  variant: "sent" | "received";
  senderC: UserProps[];
};

export const Bubble = (props: ChatBubbleProps) => {
  const {
    content,
    variant,
    timestamp,
    attachment = undefined,
    tool,
    sender,
    senderC,
  } = props;
  const isSent = variant === "sent";
  const [isHovered, setIsHovered] = React.useState<boolean>(false);
  const [isLiked, setIsLiked] = React.useState<boolean>(false);
  const [isCelebrated, setIsCelebrated] = React.useState<boolean>(false);

  return (
    <Box sx={{ maxWidth: "60%", minWidth: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 0.25 }}
      >
        <Typography level="body-xs">
          {sender === "You"
            ? sender
            : senderC
                .map((s) => {
                  return s.name;
                })
                .join(",")}
        </Typography>
        <Typography level="body-xs">
          <Moment format="MMM Do, Y hh:mm A">{timestamp}</Moment>
        </Typography>
      </Stack>
      {attachment ? (
        <Sheet
          variant="outlined"
          sx={{
            px: 1.75,
            py: 1.25,
            borderRadius: "lg",
            borderTopRightRadius: isSent ? 0 : "lg",
            borderTopLeftRadius: isSent ? "lg" : 0,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar color="primary" size="lg">
              <InsertDriveFileRounded />
            </Avatar>
            <div>
              <Typography fontSize="sm">{attachment.fileName}</Typography>
              <Typography level="body-sm">{attachment.size}</Typography>
            </div>
          </Stack>
        </Sheet>
      ) : (
        <Box
          sx={{ position: "relative" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Sheet
            color={isSent ? "primary" : "neutral"}
            variant={isSent ? "solid" : "soft"}
            sx={{
              p: 1.25,
              borderRadius: "lg",
              borderTopRightRadius: isSent ? 0 : "lg",
              borderTopLeftRadius: isSent ? "lg" : 0,
              backgroundColor: isSent
                ? "var(--joy-palette-primary-solidBg)"
                : "background.body",
            }}
          >
            {tool && tool !== undefined && tool !== null ? (
              <Tool tool={tool} />
            ) : (
              <Markdown markdown={content} />
            )}
          </Sheet>
          {(isHovered || isLiked || isCelebrated) && (
            <Stack
              direction="row"
              justifyContent={isSent ? "flex-end" : "flex-start"}
              spacing={0.5}
              sx={{
                position: "absolute",
                top: "50%",
                m: 1.5,
                p: 1.5,
                ...(isSent
                  ? {
                      left: 0,
                      transform: "translate(-100%, -50%)",
                    }
                  : {
                      right: 0,
                      transform: "translate(100%, -50%)",
                    }),
              }}
            >
              <IconButton
                variant={isLiked ? "soft" : "plain"}
                color={isLiked ? "danger" : "neutral"}
                size="sm"
                onClick={() => setIsLiked((prevState) => !prevState)}
              >
                {isLiked ? "❤️" : <FavoriteBorder />}
              </IconButton>
              <IconButton
                variant={isCelebrated ? "soft" : "plain"}
                color={isCelebrated ? "warning" : "neutral"}
                size="sm"
                onClick={() => setIsCelebrated((prevState) => !prevState)}
              >
                {isCelebrated ? "🎉" : <CelebrationOutlined />}
              </IconButton>
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
};
