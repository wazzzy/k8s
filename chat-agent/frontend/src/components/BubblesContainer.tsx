import * as React from "react";
import { Box, Stack, AvatarGroup } from "@mui/joy";

import { Bubble } from "./Bubble";
import { UserAvatar } from "./UserAvatar";
import { ChatProps, MessageProps } from "../properties/types";

type CoworkerChatBubbleProps = {
  chatMessages: MessageProps[];
  chat: ChatProps;
};

export const BubblesContainer = (props: CoworkerChatBubbleProps) => {
  const { chat, chatMessages } = props;

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        minHeight: 0,
        px: 2,
        py: 3,
        overflowY: "scroll",
        flexDirection: "column-reverse",
      }}
    >
      <Stack spacing={2} justifyContent="flex-end" m={1}>
        {chatMessages.map((message: MessageProps, index: number) => {
          const isYou = message.sender === "You";
          return (
            <Stack
              key={index}
              direction="row"
              spacing={2}
              flexDirection={isYou ? "row-reverse" : "row"}
            >
              {message.sender !== "You" && (
                <AvatarGroup>
                  {chat.sender.map((s, k) => {
                    return (
                      <UserAvatar key={k} online={s.online} src={s.avatar} />
                    );
                  })}
                </AvatarGroup>
              )}
              <Bubble
                variant={isYou ? "sent" : "received"}
                senderC={chat.sender}
                {...message}
              />
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};
