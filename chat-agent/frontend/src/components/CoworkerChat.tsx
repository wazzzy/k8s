import * as React from "react";
import readNDJSONStream from "ndjson-readablestream";

import { Sheet } from "@mui/joy";

import { aReq, aStream } from "../utils/service_utils";
import { UserGlobalContext } from "../App";
import { CoworkerChatInput } from "./CoworkerChatInput";
import { CoworkerChatHeader } from "./CoworkerChatHeader";
import {
  ChatProps,
  MessageProps,
  ToolProps,
  UserProps,
} from "../properties/types";
import { BubblesContainer } from "./BubblesContainer";

type CoworkerChatProps = {
  chat: ChatProps;
};

export const CoworkerChat = (props: CoworkerChatProps) => {
  // states definition
  let { chat } = props;
  const { user } = UserGlobalContext();
  const [chatMessages, setChatMessages] = React.useState([...chat.messages]);
  const [userChat, setUserChat] = React.useState<MessageProps | null>(null);
  // const messageRef = React.useRef<MessageProps[]>([...chat.messages]);
  const tokenRef = React.useRef<string>("");

  const setAgentResponse = async (
    content: string,
    tool: ToolProps | null,
    sender_id: "You" | UserProps[],
  ) => {
    // const sender = ''
    const data = {
      content: content,
      tool: tool,
      unread: true,
      // sender_id: chat.sender[0].id,
      // sender_id: user?.id,
      coworker_chat: chat.coworker_chat.id,
      sender_ct:
        sender_id === "You" ? chat.coworker_chat.uct : chat.coworker_chat.act,
      sender_id: sender_id === "You" ? user?.id : chat.sender[0].id,
      // timestamp: timestamp,
    };
    const reqI = {
      url: "/coworker/message/",
      method: "post",
      data: data,
      headers: { "content-type": "application/json" },
    };
    const response: any = await aReq(reqI);
    if (response?.status !== 201) {
      console.log("error...", response);
    } else {
      const timestamp = new Date().toUTCString();
      const newid = chatMessages.length + 1;
      const msgData = [
        {
          id: newid.toString(),
          content: content,
          timestamp: timestamp,
          unread: true,
          sender: sender_id === "You" ? sender_id : chat.sender,
          tool: tool,
          runid: "",
        },
      ];
      // messageRef.current.push(msgData);
      setChatMessages((prev) => [...prev, ...msgData]);
    }
  };

  React.useEffect(() => {
    setChatMessages([...chat.messages]);
  }, [chat]);

  React.useEffect(() => {
    var oldType = "";
    var toolsRunning: ToolProps[] = [];

    const addToTools = (toolToAdd: ToolProps) => {
      toolsRunning.push(toolToAdd);
    };

    const streamResponse = async (response: any) => {
      for await (const event of readNDJSONStream(response.body)) {
        // initialization
        const type = event.type;
        const sender = chat.sender;
        const content = event.content;
        const contentType = type !== "token" ? event.content?.type : "token";
        const tool_calls = contentType === "ai" && content.tool_calls;
        const tool_call_id = content.tool_call_id;

        type !== "token" && console.log("E", event);

        // Type can only be - message/token
        // Content.type can only be - ai/tool/token
        if (!oldType) {
          oldType = type;
        }
        if (oldType !== type) {
          if (oldType === "token") {
            // SAVE tokens as a message
            await setAgentResponse(tokenRef.current, null, sender);
            tokenRef.current = "";
          }
        }

        // saving token ref
        if (type === "token") {
          tokenRef.current += content;
        }

        if (type === "message") {
          if (tool_calls && tool_calls.length > 0) {
            // tool_calls.map((t: any) => {
            //   const tool = {
            //     id: t.id,
            //     name: t.name,
            //     args: JSON.stringify(t.args),
            //     snippet: "",
            //   };
            //   toolsRunning.push(tool);
            // });
            tool_calls.forEach(function (t: any) {
              const tool = {
                id: t.id,
                name: t.name,
                args: JSON.stringify(t.args),
                snippet: "",
              };
              addToTools(tool);
            });
          } else {
            if (!tool_call_id) {
              // SAVE response
              await setAgentResponse(content.content, null, sender);
            }
          }
        }

        if (contentType === "tool") {
          const toolIndex = toolsRunning.findIndex(
            (x) => tool_call_id === x.id,
          );
          const tool = toolsRunning.length
            ? {
                ...toolsRunning.at(toolIndex),
                snippet: content.content,
              }
            : null;
          if (toolIndex !== -1) {
            toolsRunning = [
              ...toolsRunning.slice(0, toolIndex),
              ...toolsRunning.slice(toolIndex + 1),
            ];
            // SAVE tools
            await setAgentResponse("", tool, sender);
          }
        }

        // assign type for next iteration
        oldType = type;
      }
    };
    // chat invoke
    const coworkerCall = async () => {
      const coworker_name = chat.sender
        .map((x) => x.name)
        .join("_")
        .toLowerCase();
      const data = {
        query: userChat?.content,
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
        streamResponse(response);
      }
    };
    userChat && userChat.content && coworkerCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userChat]);

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
        <BubblesContainer chatMessages={chatMessages} chat={chat} />
        <CoworkerChatInput
          onSubmit={(textAreaValue) => {
            const newid = chatMessages.length + 1;
            const newidString = newid.toString();
            const timestamp = new Date().toUTCString();
            const data = {
              content: textAreaValue,
              id: newidString,
              runid: "",
              sender: [] || "You",
              timestamp: timestamp,
              tool: null,
              unread: true,
            };
            setUserChat(data);
            setAgentResponse(textAreaValue, null, "You");
          }}
        />
      </Sheet>
    </>
  );
};
