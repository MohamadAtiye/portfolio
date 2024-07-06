import { Box, Container, Paper } from "@mui/material";
import { ReactNode } from "react";
import { useDashboard } from "../hooks/useDashboard";
import { APP_NAMES } from "../assets/constants";

interface PagePaperProps {
  children: ReactNode;
}
export default function PagePaper({ children }: PagePaperProps) {
  const { activeApp } = useDashboard();
  return (
    <Container
      component={Paper}
      sx={{
        borderRadius: "20px",
        flex: 1,
        padding: activeApp === APP_NAMES.null ? 0 : 1,
        overflow: "hidden",
        bgcolor: "rgba(255,255,255,0.2)",
        display: "flex",
        flexDirection: "column",
      }}
      elevation={3}
    >
      {" "}
      <Box sx={{ flex: 1, overflow: "hidden" }}>{children}</Box>
    </Container>
  );
}
