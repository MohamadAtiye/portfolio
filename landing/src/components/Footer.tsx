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
              width: "100%",
            }}
          >
            <Typography align="center">
              Be better than yesterday you.
            </Typography>
            <Typography
              align="center"
              variant="h6"
              noWrap
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Mohamad Mehdi Atiye
            </Typography>
            <Typography
              align="center"
              noWrap
              component="a"
              href="mailto:mohamad.atiye@hotmail.com"
              sx={{
                fontWeight: 700,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              mohamad.atiye@hotmail.com
            </Typography>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
