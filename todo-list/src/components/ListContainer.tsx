import { ReactNode } from "react";
// import { Colors } from "../assets/styles";
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
        padding: "8px",
        paddingTop: 0,
        // backgroundColor: Colors.componentGray,
        bgcolor: "#f5f5f5",
        overflowY: "scroll",
        scrollbarWidth: "thin",
        border: "1px solid black",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {children}
    </Paper>
  );
}
