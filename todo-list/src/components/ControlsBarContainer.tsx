import { Box } from "@mui/material";
import { ReactNode } from "react";

interface ControlsBarContainerProps {
  children: ReactNode;
}
export default function ControlsBarContainer({
  children,
}: ControlsBarContainerProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        gap: 1,
        flexWrap: "wrap",
      }}
    >
      {children}
    </Box>
  );
}
