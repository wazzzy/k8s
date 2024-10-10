import * as React from "react";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Home } from "./pages/Home";
import { Layout } from "./pages/Layout";
import { Coworkers } from "./pages/Coworkers";
import { SignIn } from "./pages/SignIn";
import { UserProps, UserDetailsProp } from "./properties/types";

const UserContext = React.createContext<UserDetailsProp>({
  user: null,
  setUser: () => {},
});

export default function App() {
  const [user, setUser] = React.useState<UserProps | null>(null);

  React.useEffect(() => {
    const getLogin = localStorage.getItem("login");
    if (getLogin) {
      const login = JSON.parse(getLogin);
      setUser(login);
    }
  }, []);

  const value = React.useMemo(() => ({ user, setUser }), [user, setUser]);

  return (
    <UserContext.Provider value={value}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="signin" element={<SignIn />} />
            <Route path="coworkers" element={<Coworkers />} />
            <Route path="coworkers/:coworkers" element={<Coworkers />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}
const UserGlobalContext = () => {
  return React.useContext(UserContext);
};
export { UserGlobalContext };
