import * as React from "react";

import { Sheet, Stack } from "@mui/joy";

import { CoworkerChat } from "./CoworkerChat";
import { CoworkerNavBar } from "./CoworkerNavBar";
import { aReq } from "../utils/service_utils";
import { ChatProps } from "../properties/types";

import CircularProgress from "@mui/material/CircularProgress";

type redirectedCoworkers = {
  selectedCoworker?: string | null;
};

export const Chat = (props: redirectedCoworkers) => {
  const { selectedCoworker } = props;
  const [coworkers, setCoworkers] = React.useState<any>(null);
  const [selectedChat, setSelectedChat] = React.useState<ChatProps | null>(
    null,
  );

  React.useMemo(() => {
    console.log("sel", selectedCoworker);
    const fetchData = async () => {
      const reqI = {
        url: "/coworker/chat/all/",
        method: "get",
        data: {},
      };
      const response: any = await aReq(reqI);
      let select = null;
      if (selectedCoworker) {
        response?.data?.forEach((res: any) => {
          if (res?.id === Number(selectedCoworker)) {
            select = res;
          }
        });
      }
      if (select) {
        setSelectedChat(select);
      } else {
        setSelectedChat(response?.data[0]);
      }
      setCoworkers(response?.data);
    };
    fetchData();
  }, [selectedCoworker]);

  return (
    <Sheet
      sx={{
        flex: 1,
        width: "100%",
        mx: "auto",
        pt: { xs: "var(--Header-height)", sm: 0 },
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "minmax(min-content, min(20%, 400px)) 1fr",
        },
      }}
    >
      {selectedChat ? (
        <>
          <Sheet
            sx={{
              position: { xs: "fixed", sm: "sticky" },
              transform: {
                xs: "translateX(calc(100% * (var(--MessagesPane-slideIn, 0) - 1)))",
                sm: "none",
              },
              transition: "transform 0.4s, width 0.4s",
              zIndex: 100,
              width: "100%",
              top: 52,
              id: selectedChat.id,
            }}
          >
            <CoworkerNavBar
              coworkers={coworkers}
              selCoworkersId={selectedChat.id}
            />
          </Sheet>
          <CoworkerChat chat={selectedChat} />
        </>
      ) : (
        <Stack
          display="flex"
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ minWidth: "100%", height: "100vh" }}
        >
          <CircularProgress />
        </Stack>
      )}
    </Sheet>
  );
};
