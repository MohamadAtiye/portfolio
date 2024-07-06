import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { Divider } from "@mui/material";
import { STRINGS, URL_DASHBOARD } from "../assets/strings";

const pages = [
  { text: "About me", anchorId: "anchor-About-me" },
  { text: "Contact", anchorId: "anchor-Contact" },
];

export default function Header() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleMenuClick = (anchorId: string) => {
    handleCloseNavMenu();
    const element = document.getElementById(anchorId);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "black" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* LOGO */}
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              // display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            M Atiye
          </Typography>

          {/* MOBILE NAV MENU */}
          <Box
            sx={{
              justifyContent: "flex-end",
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
            }}
          >
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
              slotProps={{
                paper: {
                  style: {
                    width: "100%", // Set the menu width to 100%
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  window.open(URL_DASHBOARD, "_blank");
                  handleCloseNavMenu();
                }}
              >
                <Typography width={"100%"} textAlign="center" fontSize={18}>
                  Dashboard
                </Typography>
              </MenuItem>

              {/* PAGES */}
              {pages.map((page) => (
                <MenuItem
                  key={page.text}
                  onClick={() => handleMenuClick(page.anchorId)}
                >
                  <Typography width={"100%"} textAlign="center" fontSize={18}>
                    {page.text}
                  </Typography>
                </MenuItem>
              ))}

              <Divider />

              {/* ICON */}
              <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
                <Tooltip title="Check Github">
                  <IconButton
                    href={STRINGS.social.github}
                    target="_blank"
                    onClick={handleCloseNavMenu}
                  >
                    <GitHubIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Check LinkedIn">
                  <IconButton
                    href={STRINGS.social.linkedin}
                    target="_blank"
                    onClick={handleCloseNavMenu}
                  >
                    <LinkedInIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Menu>
          </Box>

          {/* NORMAL NAV MENU */}
          <Box
            sx={{
              flexGrow: 1,
              justifyContent: "center",
              display: { xs: "none", md: "flex" },
            }}
          >
            <Button
              onClick={handleCloseNavMenu}
              sx={{ my: 2, color: "white", display: "block", mx: 2 }}
              href={URL_DASHBOARD}
              target="_blank"
            >
              Dashboard
            </Button>

            {/* PAGES */}
            {pages.map((page) => (
              <Button
                key={page.text}
                onClick={() => handleMenuClick(page.anchorId)}
                sx={{ my: 2, color: "white", display: "block", mx: 2 }}
              >
                {page.text}
              </Button>
            ))}
          </Box>

          {/* NORMAL ICONS */}
          <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
            <Tooltip title="Check Github">
              <IconButton
                size="large"
                sx={{ color: "white" }}
                href={STRINGS.social.github}
                target="_blank"
              >
                <GitHubIcon fontSize="large" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Check LinkedIn">
              <IconButton
                size="large"
                sx={{ color: "white" }}
                href={STRINGS.social.linkedin}
                target="_blank"
              >
                <LinkedInIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
