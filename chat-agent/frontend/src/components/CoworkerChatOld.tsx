import * as React from "react";
import readNDJSONStream from "ndjson-readablestream";
import { v4 as uuidv4 } from "uuid";

import { Sheet } from "@mui/joy";

import { aReq, aStream } from "../utils/service_utils";
import { UserGlobalContext } from "../App";
import { CoworkerChatInput } from "./CoworkerChatInput";
import { CoworkerChatHeader } from "./CoworkerChatHeader";
import { ChatProps } from "../properties/types";
import { BubblesContainer } from "./BubblesContainer";

type CoworkerChatProps = {
  chat: ChatProps;
};

export const CoworkerChat = (props: CoworkerChatProps) => {
  // states definition
  let { chat } = props;
  const { user } = UserGlobalContext();
  const [chatMessages, setChatMessages] = React.useState({
    call_coworker: false,
    coworker_chat: chat.coworker_chat.id,
    content: "",
    sender_id: chat.sender[0].id,
    sender_ct: chat.coworker_chat.act,
    tool: null,
    unread: true,
  });

  // refs definitions
  const toolRef = React.useRef<any>([]);
  const tokenStreamRef = React.useRef<any>([]);
  let mockChatMessages = React.useRef<any>([...chat.messages]);

  React.useEffect(() => {
    // set chatMessages
    const saveCoworkerResponse = (content: string, tool: any | null) => {
      const data = {
        call_coworker: false,
        coworker_chat: chat.coworker_chat.id,
        content: content,
        sender_id: chat.sender[0].id,
        sender_ct: chat.coworker_chat.act,
        tool: tool,
        unread: true,
      };
      setChatMessages((prev) => ({ ...prev, ...data }));
    };

    // render chatMessages
    const nSaveAndRender = (render: any) => {
      const sender = chat.sender;
      var indexS = mockChatMessages.current.findIndex(
        (x: any) => x.id === render["id"],
      );
      const timestamp = new Date().toUTCString();
      if (indexS === -1) {
        mockChatMessages.current.push({
          content: render["content"],
          id: render["id"],
          runid: render["runid"],
          sender: sender,
          timestamp: timestamp,
          tool: render["tool"],
          coworker_chat: chat.coworker_chat.id,
          call_coworker: false,
          sender_id: chat.sender[0].id,
          sender_ct: chat.coworker_chat.act,
        });
      } else {
        mockChatMessages.current = [
          ...mockChatMessages.current.slice(0, indexS),
          {
            ...mockChatMessages.current[indexS],
            content: render["content"],
            ...mockChatMessages.current.slice(indexS + 1),
          },
        ];
      }
    };

    // stream event handler
    const jsonRender = async (response: any) => {
      var oldid = "";
      for await (const event of readNDJSONStream(response.body)) {
        if (event.type !== "token") {
          console.log("E", event);
        }
        let renderProps = {
          id: "",
          content: "",
          type: event.content.type,
          tool: null,
          runid: event.content.run_id,
        };
        const newid = uuidv4();

        if (event.type === "token") {
          // check if first toke

          const newRunId = event.run_id;

          if (!oldid) {
            oldid = newid;
          }

          const indexToken = tokenStreamRef.current.findIndex(
            (x: any) => x.id === newRunId,
          );
          // console.log("idToken", indexToken, tokenStreamRef);
          if (indexToken === -1) {
            tokenStreamRef.current.push({
              id: newRunId,
              content: event.content,
            });
            renderProps["content"] = event.content;
          } else {
            // console.log("--", tokenStreamRef.current[indexToken]);
            tokenStreamRef.current[indexToken]["content"] =
              tokenStreamRef.current[indexToken]["content"] + event.content;
            renderProps["content"] =
              tokenStreamRef.current[indexToken]["content"];
          }

          renderProps["id"] = event.run_id;
          renderProps["runid"] = event.run_id;
          renderProps["type"] = event.type;
        } else {
          // check the last event is close of token
          if (oldid) {
            oldid = "";
          }

          const type = event.content.type;
          const orig_data = event?.content?.original.data;

          // tool call
          if (type === "tool") {
            console.log("Tool", toolRef.current);
            console.log("ot", orig_data.tool_call_id);
            var indexT = toolRef.current.findIndex(
              (x: any) => x.id === orig_data.tool_call_id,
            );
            console.log("indexT", indexT);
            // old toolRef found...
            if (indexT !== -1) {
              // get the tool paras stored in toolRef
              toolRef.current[indexT]["snippet"] = event.content.content;
              renderProps["tool"] = toolRef.current[indexT];
              toolRef.current = [
                ...toolRef.current.slice(0, indexT),
                ...toolRef.current.slice(indexT + 1),
              ];

              const tool = renderProps["tool"];
              console.log("tool", tool);
              saveCoworkerResponse("", tool);
            }
          }
          // tool args call or normal message
          else {
            // normal messages
            if (!event.content.tool_calls.length) {
              const isdone = orig_data.response_metadata?.done;
              const finish_reason = orig_data.response_metadata?.finish_reason;
              if (isdone || finish_reason === "stop") {
                saveCoworkerResponse(event.content.content, null);
              }
              renderProps["content"] = event.content.content;
            }
            // tool args call
            else {
              // store the tool params in toolRef
              const toolsData = event.content.tool_calls.map((x: any) => ({
                id: x.id,
                name: x.name,
                args: JSON.stringify(x.args),
                snippet: "",
              }));
              toolRef.current = toolsData;
              continue;
            }
          }
          renderProps["id"] = newid;
        }
        nSaveAndRender(renderProps);
      }
    };

    // chat invoke
    const coworkerCall = async () => {
      const coworker_name = chat.sender
        .map((x) => x.name)
        .join("_")
        .toLowerCase();
      const data = {
        query: chatMessages.content,
        id: user?.id,
        coworker_name: coworker_name,
      };
      const reqI = {
        url: `/coworker/chat/${chat.coworker_chat.id}/stream/`,
        method: "post",
        data: data,
        headers: { "content-type": "application/json" },
      };
      const response: any = await aStream(reqI);
      if (response?.status !== 200) {
        console.log("error...", response);
      } else {
        jsonRender(response);
      }
    };

    // save chats
    const storeChatMessage = async () => {
      const reqI = {
        url: "/coworker/message/",
        method: "post",
        data: chatMessages,
        headers: { "content-type": "application/json" },
      };
      const response: any = await aReq(reqI);
      if (response?.status !== 201) {
        console.log("error...", response);
      } else {
        if (chatMessages.call_coworker) coworkerCall();
      }
    };

    if (chatMessages.content || chatMessages.tool) {
      storeChatMessage();
    }
    // ieslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMessages]);

  return (
    <>
      <Sheet
        sx={{
          height: { xs: "calc(100dvh - var(--Header-height))", lg: "100dvh" },
          display: "flex",
          flexDirection: "column",
          backgroundColor: "background.level1",
        }}
      >
        {<CoworkerChatHeader sender={chat.sender} />}
        <BubblesContainer chatMessages={mockChatMessages.current} chat={chat} />
        <CoworkerChatInput
          onSubmit={(textAreaValue) => {
            const newid = mockChatMessages.current.length + 1;
            const newidString = newid.toString();
            const timestamp = new Date().toUTCString();
            const data = {
              call_coworker: true,
              content: textAreaValue,
              sender_id: user?.id,
              sender_ct: chat.coworker_chat.uct,
              coworker_chat: chat.coworker_chat.id,
              id: newidString,
              runid: "",
              sender: "You",
              timestamp: timestamp,
              tool: null,
              unread: true,
            };
            setChatMessages((x: any) => ({ ...x, ...data }));
            mockChatMessages.current.push(data);
          }}
        />
      </Sheet>
    </>
  );
};
