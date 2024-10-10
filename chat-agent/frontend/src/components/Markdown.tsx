import * as React from "react";
import { default as ReactMarkdown } from "react-markdown";
import {
  Link,
  List,
  ListItem,
  ListItemContent,
  Table,
  Typography,
} from "@mui/joy";
import remarkGfm from "remark-gfm";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
// import GlobalStyles from "@mui/material/GlobalStyles";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import scss from "react-syntax-highlighter/dist/cjs/languages/prism/scss";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import markdown from "react-syntax-highlighter/dist/cjs/languages/prism/markdown";
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";
// import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
// import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
// import { solarizedLight } from "react-syntax-highlighter/dist/cjs/styles/hljs";
// import { solarizedDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
// import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
// import { a11yLight } from "react-syntax-highlighter/dist/cjs/styles/hljs";
// import { gruvboxDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { atomOneLight } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { useTheme } from "@mui/material/styles";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ContentCopy } from "@mui/icons-material";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("scss", scss);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("json", json);

type Props = {
  code: string;
};
function CopyButton({ code }: Props) {
  return (
    <button
      className="CopyButtonClass"
      style={{
        position: "absolute",
        zIndex: 999,
        margin: 10,
        right: 20,
        padding: 5,
        borderRadius: 3,
        border: "0.5px dotted",
        cursor: "pointer",
      }}
    >
      <CopyToClipboard text={code} onCopy={() => console.log("Copied!")}>
        <div>
          <ContentCopy fontSize="inherit" />
        </div>
      </CopyToClipboard>
    </button>
  );
}

export const Markdown = ({ markdown }: { markdown: string }) => {
  const isDarkTheme = useTheme().palette.mode === "dark";
  const syntaxTheme = isDarkTheme ? atomOneDark : atomOneLight;
  const lineNumberColor = isDarkTheme ? "#3D3E4F" : "#C3C";

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // *********
        // * Links *
        // *********
        a: ({ href, children }) => (
          <Link href={href} underline={"always"}>
            {children}
          </Link>
        ),

        // ********
        // * Text *
        // ********
        p: ({ children }) => (
          <Typography sx={{ m: 1, color: "inherit" }}>{children}</Typography>
        ),
        del: ({ children }) => (
          <Typography sx={{ m: 1, textDecoration: "line-through" }}>
            {children}
          </Typography>
        ),
        em: ({ children }) => (
          <Typography sx={{ m: 1, fontStyle: "italic" }}>{children}</Typography>
        ),
        strong: ({ children }) => (
          <Typography sx={{ m: 1, fontWeight: "bold" }}>{children}</Typography>
        ),
        b: ({ children }) => (
          <Typography sx={{ m: 1, fontWeight: "bold" }}>{children}</Typography>
        ),
        h1: ({ children }) => (
          <Typography gutterBottom sx={{ m: 2 }} level={"h1"}>
            {children}
          </Typography>
        ),
        h2: ({ children }) => (
          <Typography gutterBottom sx={{ m: 2 }} level={"h2"}>
            {children}
          </Typography>
        ),
        h3: ({ children }) => (
          <Typography gutterBottom sx={{ m: 1 }} level={"h3"}>
            {children}
          </Typography>
        ),
        h4: ({ children }) => (
          <Typography gutterBottom sx={{ m: 1 }} level={"h4"}>
            {children}
          </Typography>
        ),
        h5: ({ children }) => (
          <Typography gutterBottom sx={{ m: 1 }} level={"h4"}>
            {children}
          </Typography>
        ),
        h6: ({ children }) => (
          <Typography gutterBottom sx={{ mt: 1 }} level={"h4"}>
            {children}
          </Typography>
        ),

        // **********
        // * Tables *
        // **********
        table: ({ children }) => <Table size="sm">{children}</Table>,

        // *********
        // * Lists *
        // *********
        ol: ({ children }) => (
          <List
            sx={{
              listStyleType: "decimal",
              mt: 2,
              pl: 2,
              "& .MuiListItem-root": {
                display: "list-item",
              },
            }}
          >
            {children}
          </List>
        ),
        ul: ({ children }) => (
          <List
            sx={{
              listStyleType: "disc",
              mt: 2,
              pl: 2,
              "& .MuiListItem-root": {
                display: "list-item",
              },
            }}
          >
            {children}
          </List>
        ),
        li: ({ children, ...props }) => (
          <ListItem sx={{ m: 0, p: 0, ml: 2 }}>
            <ListItemContent sx={{ pl: 0.25 }}>{children}</ListItemContent>
          </ListItem>
        ),

        // ********
        // * Code *
        // ********
        // code: ({ node, className, children, ...props }) => {
        //   return (
        //     <>
        //       <GlobalStyles
        //         styles={{
        //           code: { color: "inherit", background: "transparent" },
        //         }}
        //       />
        //     </>
        //   );
        // },

        code({ node, className, children, ref, ...props }) {
          const hasLang = /language-(\w+)/.exec(className || "");

          return hasLang ? (
            <>
              <CopyButton code={String(children).replace(/\n$/, "")} />
              <SyntaxHighlighter
                {...props}
                showLineNumbers={true}
                lineProps={() => {
                  const style: any = { display: "block", width: "fit-content" };
                  return { style };
                }}
                lineNumberStyle={{
                  minWidth: 30,
                  color: lineNumberColor,
                  fontStyle: "italic",
                }}
                wrapLongLines={true}
                PreTag="div"
                children={String(children).replace(/\n$/, "")}
                language={hasLang[1]}
                style={syntaxTheme}
                customStyle={{
                  position: "relative",
                  border: "1px solid",
                  borderColor: lineNumberColor,
                  borderRadius: "5px",
                  marginTop: 20,
                  marginBottom: 20,
                  marginLeft: 10,
                  marginRight: 10,
                }}
              />
            </>
          ) : (
            <code className={className} {...props} />
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
};
