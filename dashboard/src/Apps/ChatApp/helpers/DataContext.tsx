// AuthContext.tsx
import React, { createContext, useState, ReactNode, useEffect } from "react";
import { api_createSession, api_refreshSession } from "./apis";
import NameDialog from "../components/NameDialog";
import { Backdrop, CircularProgress } from "@mui/material";

// Define the Auth type
export type Auth = {
  token: string;
  refresh_token: string;
  userID: string;
  userName: string;
};

// Create the Auth context
export const AuthContext = createContext<
  { name: string; deleteSession: () => void } | undefined
>(undefined);

const REFRESH_TOKEN_REF = "chatRefToken";

// AuthProvider component to provide Auth context
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [auth, setAuth] = useState<Auth | null>(null);

  // on mount, check refresh token and auto login
  useEffect(() => {
    const storedToken = localStorage.getItem(REFRESH_TOKEN_REF);
    if (storedToken) {
      setIsLoading(true);
      api_refreshSession(storedToken)
        .then((newAuth) => {
          if (newAuth && newAuth.refresh_token) {
            localStorage.setItem(REFRESH_TOKEN_REF, newAuth.refresh_token);
            setAuth(newAuth);
          } else {
            localStorage.removeItem(REFRESH_TOKEN_REF);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const createSession = async (name: string) => {
    setIsLoading(true);
    const newAuth = await api_createSession(name);
    if (newAuth && newAuth.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_REF, newAuth.refresh_token);
      setAuth(newAuth);
    }
    setIsLoading(false);
  };

  const deleteSession = () => {
    localStorage.removeItem(REFRESH_TOKEN_REF);
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ name: auth?.userName ?? "", deleteSession }}>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {!auth && !isLoading && <NameDialog onSubmit={createSession} />}
      {children}
    </AuthContext.Provider>
  );
};
