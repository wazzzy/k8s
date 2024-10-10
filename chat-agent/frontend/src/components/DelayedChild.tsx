import * as React from "react";
import { useEffect } from "react";
import { Box } from "@mui/material";

export const DelayedChild = (props: any) => {
  const delayTime = 1;
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const [shouldRenderChild, setShouldRenderChild] = React.useState(false);

  useEffect(() => {
    delay(delayTime).then(() => {
      setShouldRenderChild(true);
    });
  });

  return (
    <>
      {(() => {
        if (!shouldRenderChild) {
          return (
            <Box sx={{ visibility: "hidden", height: 10, overflowY: "scroll" }}>
              {props.children}
            </Box>
          );
        } else {
          return <Box sx={{ visibility: "visible" }}>{props.children}</Box>;
        }
      })()}
    </>
  );
};
