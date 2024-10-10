import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import * as React from "react";
import Masonry from "@mui/lab/Masonry";
import { CardMedia, CardHeader } from "@mui/material";
import { Add, Check, MoreVert } from "@mui/icons-material";

import { UserGlobalContext } from "../App";
import { DelayedChild } from "./DelayedChild";
import { CoWorkersHeader } from "./CoWorkersHeader";
import { CoworkerProps } from "../properties/types";

export type CoworkersInfoProps = {
  coworkerProps: CoworkerProps[];
};

export const CoWorkers = (props: CoworkersInfoProps) => {
  const { coworkerProps } = props;
  const { user } = UserGlobalContext();
  const [coworkers, setCoworkers] =
    React.useState<CoworkerProps[]>(coworkerProps);

  return (
    <Sheet
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.level1",
      }}
    >
      <CoWorkersHeader coworkerProps={coworkers} />
      <Box
        sx={{
          justifyContent: "center",
          m: { xs: "2%", md: "6%" },
          mt: { xs: "25%", md: "6%" },
        }}
      >
        <DelayedChild>
          <Masonry
            columns={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 4 }}
            spacing={3}
            sx={{ width: "auto" }}
          >
            {coworkers.map((worker: CoworkerProps, key: any) => (
              <Card key={key}>
                <CardHeader
                  action={
                    <IconButton>
                      <MoreVert />
                    </IconButton>
                  }
                  avatar={<Avatar alt="Apple">{worker.name[0]}</Avatar>}
                  title={worker.name + " (Co-Worker)"}
                  subheader={worker.subheader}
                  titleTypographyProps={{ variant: "h4", component: "span" }}
                />
                <CardMedia
                  component="img"
                  height="194"
                  image={worker.src_large}
                  alt={worker.name}
                  loading="lazy"
                />
                <CardContent>
                  <Stack
                    spacing={0.5}
                    sx={{ mt: 1, minHeight: 100, overflowY: "auto" }}
                  >
                    <Typography>{worker.desc}</Typography>
                  </Stack>
                  <Typography>
                    <b>Benefits:</b>
                  </Typography>
                  <Stack
                    spacing={0.5}
                    sx={{ mt: 1, height: 300, overflowY: "auto" }}
                  >
                    {worker.benefits.map((benefit, keyIn) => (
                      <Typography variant="plain" key={keyIn}>
                        {benefit}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
                <CardActions style={{ justifyContent: "right" }}>
                  {user && (
                    <Button
                      onClick={() => {
                        const newWorker = coworkers.map((a) =>
                          a.name === worker.name
                            ? { ...a, to_chat: !a.to_chat }
                            : a,
                        );
                        setCoworkers(newWorker);
                      }}
                      startDecorator={worker.to_chat ? <Check /> : <Add />}
                    >
                      to chat
                    </Button>
                  )}
                </CardActions>
              </Card>
            ))}
          </Masonry>
        </DelayedChild>
      </Box>
    </Sheet>
  );
};
