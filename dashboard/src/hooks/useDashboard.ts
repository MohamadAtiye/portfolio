import { useContext } from "react";
import { DashboardContext } from "./DashboardData";

export function useDashboard() {
  return useContext(DashboardContext);
}
