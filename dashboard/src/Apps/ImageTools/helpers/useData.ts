import { useContext } from "react";
import { DataContext } from "./DataContext";

export enum ACTIONS {
  none = "none",
  crop = "crop",
  resize = "resize",
  history = "history",
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
