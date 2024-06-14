import { Box, Container, Paper } from "@mui/material";
import { ReactNode } from "react";
import SubHeader from "./SubHeader";

interface PagePaperProps {
  subheader: string;
  children: ReactNode;
}
export default function PagePaper({ subheader, children }: PagePaperProps) {
  return (
    <Container
      component={Paper}
      sx={{
        borderRadius: "20px",
        flex: 1,
        padding: 1,
        overflow: "hidden",
        bgcolor: "rgba(255,255,255,0.2)",
        display: "flex",
        flexDirection: "column",
      }}
      elevation={3}
    >
      <SubHeader text={subheader} />
      <Box sx={{ flex: 1, overflow: "hidden" }}>{children}</Box>
    </Container>
  );
}
