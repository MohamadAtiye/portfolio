import React, { createContext, useState } from "react";
import { APP_NAMES } from "../assets/constants";

export const DashboardContext = createContext<{
  activeApp: APP_NAMES;
  startApp: (v: APP_NAMES) => void;
}>({ activeApp: APP_NAMES.null, startApp: () => {} });

export default function DashboardData() {
  return <div>DashboardData</div>;
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [activeApp, setActiveApp] = useState<APP_NAMES>(APP_NAMES.null);
  const startApp = (v: APP_NAMES) => {
    setActiveApp(v);
  };

  return (
    <DashboardContext.Provider
      value={{
        activeApp,
        startApp,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
