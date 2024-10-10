import * as React from "react";
import { Box, Button, FormControl, Stack, Textarea } from "@mui/joy";

import { SendRounded } from "@mui/icons-material";

export type ChatInputProps = {
  onSubmit: (a: string) => void;
};

export const CoworkerChatInput = (props: ChatInputProps) => {
  const [textAreaValue, setTextAreaValue] = React.useState("");
  const { onSubmit } = props;
  const textAreaRef = React.useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (textAreaValue.trim() !== "") {
      onSubmit(textAreaValue);
    }
    setTextAreaValue("");
  };

  return (
    <Box sx={{ px: 2, pb: 3 }}>
      <FormControl>
        <Textarea
          placeholder="Type something here…"
          aria-label="Message"
          ref={textAreaRef}
          autoFocus
          onChange={(e) => {
            setTextAreaValue(e.target.value);
          }}
          value={textAreaValue}
          minRows={2}
          maxRows={10}
          endDecorator={
            <Stack
              direction="row"
              justifyContent="right"
              alignItems="center"
              flexGrow={1}
              sx={{
                py: 1,
                pr: 1,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                size="sm"
                color="primary"
                sx={{ alignSelf: "center", borderRadius: "sm" }}
                endDecorator={<SendRounded />}
                onClick={handleClick}
              >
                Send
              </Button>
            </Stack>
          }
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              handleClick();
              event.preventDefault();
            }
          }}
          sx={{
            "& textarea:first-of-type": {
              minHeight: 48,
            },
          }}
        />
      </FormControl>
    </Box>
  );
};
