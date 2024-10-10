import { Outlet } from "react-router-dom";
import { Box, CssBaseline, CssVarsProvider } from "@mui/joy";

import { Header } from "../components/Header";
import { SideBar } from "../components/SideBar";
import { extendTheme } from "@mui/joy/styles";

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          "50": "#fbe9e7",
          "100": "#ffccbc",
          "200": "#ffab91",
          "300": "#ff8a65",
          "400": "#ff7043",
          "500": "#ff5722",
          "600": "#f4511e",
          "700": "#e64a19",
          "800": "#d84315",
          "900": "#bf360c",
          solidBg: "var(--joy-palette-primary-400)",
          solidActiveBg: "var(--joy-palette-primary-500)",
          outlinedBorder: "var(--joy-palette-primary-700)",
          outlinedColor: "var(--joy-palette-primary-600)",
          outlinedActiveBg: "var(--joy-palette-primary-900)",
          softColor: "var(--joy-palette-primary-500)",
          softBg: "var(--joy-palette-primary-900)",
          softActiveBg: "var(--joy-palette-primary-800)",
          plainColor: "var(--joy-palette-primary-500)",
          plainActiveBg: "var(--joy-palette-primary-900)",
        },
        text: {
          primary: "#d6536d",
          secondary: "#d6536d",
          tertiary: "#d6536d",
          icon: "#d6536d",
        },
        background: {
          body: "#e6e2da",
          surface: "#e6e2da",
          popup: "#ede9e1",
          level1: "#ede9e1",
          level2: "#ede9e1",
          level3: "#ede9e1",
        },
        divider: "#fff",
      },
    },
    dark: {
      palette: {
        primary: {
          50: "#e6e7e8",
          100: "#cdcfd2",
          200: "#b4b7bb",
          300: "#9b9fa4",
          400: "#83888e",
          500: "#6a7077",
          600: "#515860",
          700: "#38404a",
          800: "#1f2833",
          900: "#1f2833",
          solidBg: "var(--joy-palette-primary-400)",
          solidActiveBg: "var(--joy-palette-primary-500)",
          outlinedBorder: "var(--joy-palette-primary-700)",
          outlinedColor: "var(--joy-palette-primary-600)",
          outlinedActiveBg: "var(--joy-palette-primary-900)",
          softColor: "var(--joy-palette-primary-500)",
          softBg: "var(--joy-palette-primary-900)",
          softActiveBg: "var(--joy-palette-primary-800)",
          plainColor: "var(--joy-palette-primary-500)",
          plainActiveBg: "var(--joy-palette-primary-900)",
        },
        text: {
          primary: "#e6e9e9",
          secondary: "#e6e9e9",
          tertiary: "#e6e9e9",
          icon: "#e6e9e9",
        },
        background: {
          body: "#0b0c10",
          surface: "#0b0c10",
          popup: "#1f2833",
          level1: "#1f2833",
          level2: "#1f2833",
          level3: "#1f2833",
        },
        divider: "#000",
      },
    },
  },
  radius: {
    xs: "2px",
    sm: "3px",
    md: "4px",
    lg: "6px",
    xl: "6px",
  },
  // variants: {
  //   plain: {
  //     primary: {
  //       color: "#d6536d",
  //     },
  //     neutral: {
  //       color: "#d6536d",
  //     },
  //   },
  //   soft: {
  //     primary: {
  //       color: "#d6536d",
  //     },
  //     neutral: {
  //       color: "#d6536d",
  //     },
  //   },
  //   outlined: {
  //     primary: {
  //       color: "#d6536d",
  //       backgroundColor: "#ede9e1",
  //     },
  //     neutral: {
  //       color: "#d6536d",
  //       backgroundColor: "#ede9e1",
  //     },
  //   },
  //   outlinedHover: {
  //     primary: {
  //       color: "#d6536d",
  //       backgroundColor: "#e6e2da",
  //     },
  //     neutral: {
  //       color: "#d6536d",
  //       backgroundColor: "#e6e2da",
  //     },
  //   },
  //   plainHover: {
  //     primary: {
  //       backgroundColor: "#ede9e1",
  //     },
  //     neutral: {
  //       backgroundColor: "#ede9e1",
  //     },
  //   },
  //   plainActive: {
  //     primary: {
  //       backgroundColor: "#ede9e1",
  //     },
  //     neutral: {
  //       backgroundColor: "#ede9e1",
  //     },
  //   },
  // },
  typography: {
    // h1: {
    //   color: "#d6536d",
    // },
    // h2: {
    //   color: "#d6536d",
    // },
    // h3: {
    //   color: "#d6536d",
    // },
    // h4: {
    //   color: "#d6536d",
    // },
    // "title-lg": {
    //   color: "#d6536d",
    // },
    // "title-md": {
    //   color: "#d6536d",
    // },
    // "title-sm": {
    //   color: "#d6536d",
    // },
    // "body-lg": {
    //   color: "#d6536d",
    // },
    // "body-md": {
    //   color: "#d6536d",
    // },
    // "body-sm": {
    //   color: "#d6536d",
    // },
    // "body-xs": {
    //   color: "#d6536d",
    // },
  },
});

export const Layout = () => {
  return (
    <CssVarsProvider theme={theme} disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <SideBar />
        <Header />
        <Box component="main" className="MainContent" sx={{ flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </CssVarsProvider>
  );
};
