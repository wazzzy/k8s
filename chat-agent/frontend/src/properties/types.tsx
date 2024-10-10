export type UserProps = {
  id: number;
  name: string;
  email: string;
  avatar: string | "";
  graph: string | "";
  online: boolean | true;
};

export type ToolProps = {
  id?: string;
  name?: string;
  args?: string;
  snippet?: string;
};

export type MessageProps = {
  id: string;
  content: string;
  timestamp: string;
  unread?: boolean;
  sender: UserProps[] | "You";
  tool?: ToolProps | null;
  runid: string;
  attachment?: {
    fileName: string;
    type: string;
    size: string;
  };
};

export type CoworkerChatProps = {
  id: number;
  uct: number;
  act: number;
};

export type ChatProps = {
  id: string;
  sender: UserProps[];
  messages: MessageProps[];
  coworker_chat: CoworkerChatProps;
};

export type CoworkerProps = {
  id: number;
  name: string;
  subheader: string;
  src: string;
  src_large: string;
  desc: string;
  benefits: string[];
  to_chat: boolean;
};

export interface UserDetailsProp {
  user: UserProps | null;
  setUser: React.Dispatch<React.SetStateAction<UserProps | null>>;
}

export {};
