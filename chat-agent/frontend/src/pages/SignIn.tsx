import {
  Box,
  Button,
  CssVarsProvider,
  GlobalStyles,
  CssBaseline,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Typography,
  Snackbar,
  Stack,
} from "@mui/joy";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { EmailOutlined, PersonOutline } from "@mui/icons-material";

import { UserGlobalContext } from "../App";
import { aReq } from "../utils/service_utils";

export interface Snack {
  open: boolean;
  message: string;
}

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  name: HTMLInputElement;
}

export interface SignInFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export const SignIn = () => {
  const navigate = useNavigate();
  const { user, setUser } = UserGlobalContext();
  const [snack, setSnack] = React.useState<Snack>({ open: false, message: "" });

  const handleClose = () => {
    setSnack({ ...snack, open: false });
  };

  const saveUser = async (data: any) => {
    const reqI = {
      url: "/user/",
      method: "post",
      data: data,
      headers: { "content-type": "application/json" },
    };
    const response: any = await aReq(reqI);
    if (response?.status === 201) {
      data["id"] = response?.data.id;
      setUser(data);
      localStorage.setItem("login", JSON.stringify(data));
      navigate("/");
    } else {
      setSnack((prevSnack) => ({
        ...prevSnack,
        open: true,
        message: "Error in sign-in!!!",
      }));
    }
  };

  return (
    <CssVarsProvider defaultMode="dark" disableTransitionOnChange>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ":root": {
            "--Form-maxWidth": "800px",
            "--Transition-duration": "0.4s", // set to `none` to disable transition
          },
        }}
      />
      <Box
        sx={(theme) => ({
          transition: "width var(--Transition-duration)",
          transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "flex-end",
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(255 255 255 / 0.2)",
          [theme.getColorSchemeSelector("dark")]: {
            backgroundColor: "rgba(19 19 24 / 0.4)",
          },
        })}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100dvh",
            width: "100%",
            px: 2,
          }}
        >
          <Box
            component="main"
            sx={{
              my: "auto",
              py: 2,
              pb: 5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: 400,
              maxWidth: "100%",
              mx: "auto",
              borderRadius: "sm",
              "& form": {
                display: "flex",
                flexDirection: "column",
                gap: 2,
              },
              [`& .MuiFormLabel-asterisk`]: {
                visibility: "hidden",
              },
            }}
          >
            <Stack gap={4} sx={{ mt: 2 }}>
              {user === null ? (
                <form
                  onSubmit={(event: React.FormEvent<SignInFormElement>) => {
                    event.preventDefault();
                    const formElements = event.currentTarget.elements;
                    const data = {
                      email: formElements.email.value,
                      name: formElements.name.value,
                      online: true,
                      avatar: formElements.email.value[0],
                    };
                    if (data) {
                      saveUser(data);
                    }
                  }}
                >
                  <FormControl required>
                    <FormLabel>Name</FormLabel>
                    <Input
                      type="text"
                      autoComplete="off"
                      name="name"
                      startDecorator={<PersonOutline />}
                      slotProps={{
                        input: {
                          pattern: "^[a-zA-Z0-9_]{3,}$",
                        },
                      }}
                    />
                    <FormHelperText id="name-helper-text">
                      Should be atleast 3 chars long.
                    </FormHelperText>
                  </FormControl>
                  <FormControl required>
                    <FormLabel>Email</FormLabel>
                    <Input
                      autoComplete="off"
                      type="email"
                      name="email"
                      startDecorator={<EmailOutlined />}
                    />
                    <FormHelperText id="email-helper-text">
                      We'll never share your email.
                    </FormHelperText>
                  </FormControl>
                  <Stack gap={4} sx={{ mt: 2 }}>
                    <Button type="submit" fullWidth>
                      Sign in
                    </Button>
                  </Stack>
                </form>
              ) : (
                <Typography>
                  You are already logged in <b>{user?.name}</b> !!!
                </Typography>
              )}
            </Stack>
          </Box>
          <Box component="footer" sx={{ py: 3 }}>
            <Typography level="body-xs" textAlign="center">
              © E42.ai {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Box>
      {snack.open && (
        <Box sx={{ width: 500 }}>
          <Snackbar
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            open={snack.open}
            variant="soft"
            color="danger"
            onClose={handleClose}
          >
            {snack.message}
          </Snackbar>
        </Box>
      )}
    </CssVarsProvider>
  );
};
