import {
  AccordionGroup,
  Accordion,
  AccordionDetails,
  accordionDetailsClasses,
  AccordionSummary,
  accordionSummaryClasses,
  Chip,
  ChipDelete,
  Divider,
  Stack,
  Typography,
} from "@mui/joy";
import HandymanTwoToneIcon from "@mui/icons-material/HandymanTwoTone";

import { ToolProps } from "../properties/types";
import { Markdown } from "./Markdown";

type toolProps = {
  tool: ToolProps | null;
};

export const Tool = (props: toolProps) => {
  const { tool } = props;
  return (
    <AccordionGroup
      variant="outlined"
      transition="0.2s"
      sx={(theme) => ({
        maxWidth: 400,
        borderRadius: "sm",
        [`& .${accordionSummaryClasses.button}:hover`]: {
          bgcolor: "transparent",
        },
        [`& .${accordionDetailsClasses.content}`]: {
          boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,
          [`&.${accordionDetailsClasses.expanded}`]: {
            paddingBlock: "0.75rem",
          },
        },
      })}
    >
      <Accordion>
        <AccordionSummary>
          <Stack direction="row" gap={1} padding={1}>
            <Chip
              variant="outlined"
              color="success"
              endDecorator={
                <ChipDelete color="success" variant="plain" component="div">
                  <HandymanTwoToneIcon />
                </ChipDelete>
              }
              sx={{
                "--Chip-radius": "5px",
              }}
            >
              Tool
            </Chip>
            <Typography>{tool?.name}</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails variant="soft">
          <Stack direction="row" gap={1} padding={1}>
            <Chip
              variant="soft"
              color="primary"
              sx={{
                "--Chip-radius": "5px",
              }}
            >
              Args
            </Chip>
            <Typography>{tool?.args}</Typography>
          </Stack>
          <Divider></Divider>
          <Stack direction="column" gap={1} padding={1}>
            <Chip
              variant="soft"
              color="primary"
              sx={{
                "--Chip-radius": "5px",
              }}
            >
              Result
            </Chip>
            <Markdown markdown={tool?.snippet ? tool.snippet : ""} />
          </Stack>
        </AccordionDetails>
      </Accordion>
    </AccordionGroup>
  );
};
