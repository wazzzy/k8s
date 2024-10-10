import { AvatarGroup } from "@mui/material";
import { Avatar, Button, Stack } from "@mui/joy";
import { Link, useNavigate } from "react-router-dom";

import { UserGlobalContext } from "../App";
import { aReq } from "../utils/service_utils";
import { CoworkerProps } from "../properties/types";

export type CoworkersInfoProps = {
  coworkerProps: CoworkerProps[];
};

export const CoWorkersHeader = (props: CoworkersInfoProps) => {
  let navigate = useNavigate();
  const { coworkerProps } = props;
  const { user } = UserGlobalContext();
  const selectedCoworkers = coworkerProps.filter((a) => a.to_chat === true);

  // TODO
  // handle error
  const saveCoworkers = async () => {
    const data = {
      coworker: selectedCoworkers.map((a) => a.id),
      user: user?.id,
    };
    const reqI = {
      url: "/coworker/chat/",
      method: "post",
      data: data,
      headers: { "content-type": "application/json" },
    };
    const response: any = await aReq(reqI);
    if (response?.status !== 201) {
      console.log("error...");
    } else {
      navigate(`/coworkers/${response?.data?.id}`);
    }
  };

  return (
    <Stack
      direction="row"
      justifyContent="end"
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.body",
        marginTop: { xs: "13%", sm: "0" },
        position: { xs: "fixed", sm: "inherit" },
        zIndex: { xs: 9999, sm: "inherit" },
        width: { xs: "100%", sm: "inherit" },
      }}
      py={{ xs: 1, md: 2 }}
      px={{ xs: 1, md: 2 }}
    >
      <Stack spacing={1} direction="row" alignItems="center">
        {user ? (
          <>
            <Button
              disabled={selectedCoworkers.length > 0 ? false : true}
              color="neutral"
              variant="outlined"
              size="sm"
              style={{ textTransform: "capitalize" }}
              sx={{
                display: { xs: "flex", md: "inline-flex" },
              }}
              onClick={() => {
                saveCoworkers();
              }}
            >
              {selectedCoworkers.length <= 0 && `Select coworkers to `} Chat{" "}
              {selectedCoworkers.length > 0 && `with`}
            </Button>
            <AvatarGroup
              slotProps={{
                additionalAvatar: {
                  sx: {
                    backgroundColor: "green",
                    width: "25px",
                    height: "25px",
                  },
                },
              }}
            >
              {selectedCoworkers.map((item, key) => (
                <Avatar
                  alt={item.name}
                  sx={{ width: 24, height: 24 }}
                  key={key}
                  src={item.src}
                />
              ))}
            </AvatarGroup>
          </>
        ) : (
          <Button
            color="neutral"
            variant="outlined"
            to="/signin"
            component={Link}
            size="sm"
            sx={{
              display: { xs: "none", md: "inline-flex" },
            }}
          >
            Interact with Co-Workers
          </Button>
        )}
      </Stack>
    </Stack>
  );
};
