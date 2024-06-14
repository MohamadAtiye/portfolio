import { Button, Container, Typography } from "@mui/material";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import SettingsVoiceIcon from "@mui/icons-material/SettingsVoice";
import { ReactNode } from "react";

interface HeaderIconProps {
  icon: ReactNode;
  text: string;
}
function HeaderIcon({ icon, text }: HeaderIconProps) {
  return (
    <Button
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "80px",
      }}
    >
      {icon}
      <Typography fontSize={10}>{text}</Typography>
    </Button>
  );
}

export default function Header() {
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
        text={"ToDo"}
      />
      <HeaderIcon
        icon={<SettingsVoiceIcon fontSize="large" />}
        text={"Recorder"}
      />
    </Container>
  );
}
