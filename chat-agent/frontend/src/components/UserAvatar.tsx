import { Avatar } from "@mui/joy";

import { AvatarProps } from "@mui/joy";

export type UserAvatarProps = AvatarProps & {
  online?: boolean;
  srt?: string;
};

export const UserAvatar = (props: UserAvatarProps) => {
  const { src } = props;
  return <Avatar size="sm" src={src} />;
};
