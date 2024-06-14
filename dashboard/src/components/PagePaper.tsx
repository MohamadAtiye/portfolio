import { Container, Paper } from "@mui/material";
import { ReactNode } from "react";

interface PagePaperProps {
  children: ReactNode;
}
export default function PagePaper({ children }: PagePaperProps) {
  return (
    <Container
      component={Paper}
      sx={{
        borderRadius: "20px",
        flex: 1,
        padding: 1,
        overflow: "hidden",
        bgcolor: "rgba(255,255,255,0.2)",
      }}
      elevation={3}
    >
      {children}
    </Container>
  );
}
