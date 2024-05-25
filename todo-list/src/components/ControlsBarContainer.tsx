import { Paper } from "@mui/material";
import { ReactNode } from "react";

interface ControlsBarContainerProps {
  children: ReactNode;
}
export default function ControlsBarContainer({
  children,
}: ControlsBarContainerProps) {
  return (
    <Paper
      sx={{
        display: "flex",
        backgroundColor: "rgba(255,255,255,0.5);",
      }}
    >
      {children}
    </Paper>
  );
}
