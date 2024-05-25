import { Box, Container, useMediaQuery, useTheme } from "@mui/material";
import { ReactNode } from "react";
import GLBackground from "./GLBackground";

interface AppContainerProps {
  children: ReactNode;
}
export default function AppContainer({ children }: AppContainerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        margin: 0,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          height: "100%",
          overflow: "hidden",
        }}
      >
        <GLBackground />
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: isMobile ? 1 : "32px 0",
            paddingBottom: isMobile ? 1 : "20vh",
            gap: 1,
          }}
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
}
