import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";

export default function Footer() {
  return (
    <AppBar position="static" sx={{ bgcolor: "black", p: 1 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              //   gap: 1,
              //   justifyContent: "center",
              //   alignItems: "center",
              width: "100%",
            }}
          >
            <Typography align="center">
              Be better than yesterday you. Made By me
            </Typography>
            <Typography
              align="center"
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              M Atiye
            </Typography>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
