import { useParams } from "react-router-dom";

import { Chat } from "../components/Chat";
import { UserGlobalContext } from "../App";

export const Coworkers = () => {
  const { user } = UserGlobalContext();
  const { coworkers } = useParams();
  return user && <Chat selectedCoworker={coworkers} />;
};
