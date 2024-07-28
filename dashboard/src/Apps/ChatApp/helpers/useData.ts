import { useContext } from "react";
import { AuthContext } from "./DataContext";

export const useData = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
