import * as React from "react";

import { aReq } from "../utils/service_utils";
import { CoWorkers } from "../components/CoWorkers";

export const Home = () => {
  const [coworkers, setCoworkers] = React.useState<any>();

  React.useEffect(() => {
    const fetchData = async () => {
      const reqI = {
        url: "/coworker/",
        method: "get",
        data: {},
      };
      let response: any = await aReq(reqI);
      setCoworkers(response?.data);
    };

    fetchData();
  }, []);

  return coworkers && <CoWorkers coworkerProps={coworkers} />;
};
