import {
  GlobalStyles,
  Stack,
  Sheet,
  Typography,
  IconButton,
  List,
} from "@mui/joy";

import { CloseRounded } from "@mui/icons-material";

import { CoworkerList } from "./CoworkerList";
import { ChatProps } from "../properties/types";
import { toggleMessagesPane } from "../utils/utils";

type CoworkerListProps = {
  coworkers: ChatProps[];
  selCoworkersId: string;
};

export const CoworkerNavBar = (props: CoworkerListProps) => {
  const { coworkers, selCoworkersId } = props;

  return (
    <Sheet
      sx={{
        borderRight: "1px solid",
        borderColor: "divider",
        height: "calc(100dvh - var(--Header-height))",
        overflowY: "auto",
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ":root": {
            "--CoworkerBar-width": "220px",
            [theme.breakpoints.up("lg")]: {
              "--CoworkerBar-width": "240px",
            },
          },
        })}
      />
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        p={2}
        pb={1.5}
      >
        <Typography
          fontSize={{ xs: "md", md: "lg" }}
          component="h1"
          fontWeight="lg"
          textAlign="center"
          sx={{ mr: "auto" }}
        >
          Co-Worker Playground
        </Typography>
        <IconButton
          variant="plain"
          aria-label="edit"
          color="neutral"
          size="sm"
          disabled
          onClick={() => {
            toggleMessagesPane();
          }}
        >
          <CloseRounded />
        </IconButton>
      </Stack>
      <List
        sx={{
          py: 0,
          "--ListItem-paddingY": "0.75rem",
          "--ListItem-paddingX": "1rem",
        }}
      >
        {coworkers.map((coworker) => (
          <CoworkerList
            key={coworker.id}
            {...coworker}
            selCoworkersId={selCoworkersId}
          />
        ))}
      </List>
    </Sheet>
  );
};
