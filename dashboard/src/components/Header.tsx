import { Button, Container, Typography } from "@mui/material";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import SettingsVoiceIcon from "@mui/icons-material/SettingsVoice";
import { ReactNode } from "react";
import { useDashboard } from "../hooks/useDashboard";

interface HeaderIconProps {
  icon: ReactNode;
  app: string;
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}
function HeaderIcon({ icon, app, onClick }: HeaderIconProps) {
  return (
    <Button
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "80px",
        "& svg": {
          transition: "transform 0.2s ease-in-out", // Add the transition
        },
        ":hover": {
          "& svg": {
            transform: "scale(1.1)", // Scale the SVG on hover
          },
        },
      }}
      onClick={onClick}
    >
      {icon}
      <Typography fontSize={10}>{app}</Typography>
    </Button>
  );
}

export default function Header() {
  const { startApp } = useDashboard();

  return (
    <Container
      sx={{
        height: "80x",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <HeaderIcon
        icon={<PlaylistAddCheckIcon fontSize="large" />}
        app={"todo"}
        onClick={() => {
          startApp("todo");
        }}
      />
      <HeaderIcon
        icon={<SettingsVoiceIcon fontSize="large" />}
        app={"recorder"}
        onClick={() => {
          startApp("recorder");
        }}
      />
    </Container>
  );
}
