import React, { createContext, useState } from "react";

export const DashboardContext = createContext<{
  activeApp: string;
  startApp: (v: string) => void;
}>({ activeApp: "", startApp: () => {} });

export default function DashboardData() {
  return <div>DashboardData</div>;
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [activeApp, setActiveApp] = useState("");
  const startApp = (v: string) => {
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
