import { ReactNode } from "react";
import { Paper } from "@mui/material";

interface ListContainerProps {
  children: ReactNode;
}
export default function ListContainer({ children }: ListContainerProps) {
  return (
    <Paper
      elevation={3}
      sx={{
        flex: 1,
        position: "relative",
        padding: "8px 0",
        paddingTop: 0,
        bgcolor: "#f5f5f5",
        overflowY: "scroll",
        scrollbarWidth: "thin",
        border: "1px solid black",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        backgroundColor: "rgba(255,255,255,0.5);",
      }}
    >
      {children}
    </Paper>
  );
}
