import * as React from "react";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogContent from "@mui/joy/DialogContent";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";

import { Avatar, Card, CardContent, IconButton, Stack } from "@mui/joy";
import { CardMedia, CardHeader } from "@mui/material";
import { MoreVert } from "@mui/icons-material";

// TODO
// change any with interface props
export const Profile = (props: any) => {
  const { openProfile, toggleProfile, sender } = props;
  // const [scroll, setScroll] = React.useState<boolean>(true);
  const senderLen = sender.length;
  const sender_name = sender
    .map((s: any) => {
      return s.name;
    })
    .join(", ");

  return (
    <React.Fragment>
      <Modal keepMounted open={openProfile} onClose={() => toggleProfile()}>
        <ModalDialog>
          <ModalClose />
          <DialogContent>
            <List
              sx={[
                {
                  mx: "calc(-1 * var(--ModalDialog-padding))",
                  px: "var(--ModalDialog-padding)",
                },
                // scroll ? { overflow: "scroll" } : { overflow: "initial" },
              ]}
            >
              <ListItem>
                <Card>
                  <CardHeader
                    avatar={<Avatar alt="Apple">{sender_name[0]}</Avatar>}
                    title={sender_name + "'s Workflow!"}
                    titleTypographyProps={{ variant: "h4", component: "span" }}
                  />
                  <CardMedia
                    component="img"
                    // height="594"
                    image={sender[0].graph}
                    alt={sender_name}
                    loading="lazy"
                  />
                </Card>
              </ListItem>
            </List>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </React.Fragment>
  );
};
