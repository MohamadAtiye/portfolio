// AuthContext.tsx
import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import {
  api_createSession,
  api_getSMS,
  api_refreshSession,
  api_sendSMS,
} from "./apis";
import NameDialog from "../components/NameDialog";
import { Backdrop, CircularProgress } from "@mui/material";

// Define the Auth type
export type Auth = {
  token: string;
  refresh_token: string;
  userID: string;
  userName: string;
};

export type SMS = {
  id: number;
  from_user: string;
  from_user_name: string;
  to_user: string;
  content: string;
  sendTS: number;
};

// Create the Auth context
export const AuthContext = createContext<
  | {
      name: string;
      userID: string;
      chatHistory: SMS[];
      deleteSession: () => void;
      sendSms: (content: string) => void;
    }
  | undefined
>(undefined);

const REFRESH_TOKEN_REF = "chatRefToken";
export const MAX_SMS_LENGTH = 160;
export const MAX_NAME_LENGTH = 30;
export const MIN_NAME_LENGTH = 5;

// AuthProvider component to provide Auth context
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [auth, setAuth] = useState<Auth | null>(null);

  const [chatHistory, setChatHistory] = useState<SMS[]>([]);

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
    setChatHistory([]);
    lastId.current = 0;
  };

  const sendSms = async (content: string) => {
    if (!auth || !auth.token) return;
    await api_sendSMS("general", content, auth.token);
  };

  // TODO: run long poll to get sms if user has auth
  const lastId = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      if (auth && auth.token) {
        api_getSMS(lastId.current, auth.token).then((res) => {
          if (res && res.length > 0) {
            lastId.current = res[res.length - 1].id;
            const maxId = Math.max(...res.map((s) => s.id));
            lastId.current = maxId;
            console.log(res, lastId.current);

            if (auth && auth.token)
              setChatHistory((p) => {
                const updated = [...p, ...res].sort(
                  (a, b) => a.sendTS - b.sendTS
                );
                return updated;
              });
          }
        });
      }
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [auth]);

  return (
    <AuthContext.Provider
      value={{
        name: auth?.userName ?? "",
        userID: auth?.userID ?? "",
        chatHistory,
        deleteSession,
        sendSms,
      }}
    >
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
