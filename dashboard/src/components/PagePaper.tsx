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
        minHeight: "calc(100vh - 96px);",
        borderRadius: "20px",
      }}
      elevation={3}
    >
      {children}
    </Container>
  );
}
