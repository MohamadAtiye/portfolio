import { Button, Container, Paper, Typography } from "@mui/material";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { ReactNode, useState } from "react";
import { useDashboard } from "../hooks/useDashboard";
import { APPS, APP_NAMES } from "../assets/constants";

interface HeaderIconProps {
  icon: ReactNode;
  app: APP_NAMES;
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
  isScale?: boolean;
}
function HeaderIcon({ icon, app, onClick, isScale }: HeaderIconProps) {
  return (
    <Button
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "80px",
        transform: isScale ? "scale(1.5)" : "scale(1)", // Scale the SVG on hover
        transition: "transform 0.5s ease-in-out",
        "& svg": {
          transition: "transform 0.2s ease-in-out", // Add the transition
        },
        ":hover": {
          "& svg": {
            transform: "scale(1.2)", // Scale the SVG on hover
          },
        },
        color: "black",
      }}
      onClick={onClick}
    >
      {icon}
      <Typography fontSize={10}>{APPS[app].text}</Typography>
    </Button>
  );
}

export default function Header() {
  const { activeApp, startApp } = useDashboard();
  const [transitionTo, setTrasitionTo] = useState<APP_NAMES>(activeApp);

  const handleClickApp = (v: APP_NAMES) => {
    if (v === APP_NAMES.null) {
      startApp(v);
    } else if (activeApp !== APP_NAMES.null) {
      startApp(v);
    } else {
      setTimeout(() => {
        startApp(v);
      }, 500);
    }
    setTrasitionTo(v);
  };

  const isScale = transitionTo === APP_NAMES.null;

  return (
    <Container
      sx={{
        height: isScale ? "50vh" : "160px",
        transition: "height 0.5s ease-out",

        display: "flex",
        // alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        bgcolor: "rgba(255,255,255,0.2)",
        borderRadius: "0 0 20px 20px",
        gap: isScale ? 4 : 1,
        flexWrap: "wrap",
      }}
      component={Paper}
    >
      <HeaderIcon
        icon={<PlaylistAddCheckIcon fontSize="large" />}
        app={APP_NAMES.todo}
        onClick={() => {
          handleClickApp(APP_NAMES.todo);
        }}
        isScale={isScale}
      />
      <HeaderIcon
        icon={<AccessTimeIcon fontSize="large" />}
        app={APP_NAMES.time}
        onClick={() => {
          handleClickApp(APP_NAMES.time);
        }}
        isScale={isScale}
      />
      <HeaderIcon
        icon={<TimerOutlinedIcon fontSize="large" />}
        app={APP_NAMES.stopwatch}
        onClick={() => {
          handleClickApp(APP_NAMES.stopwatch);
        }}
        isScale={isScale}
      />
      <HeaderIcon
        icon={<MicNoneOutlinedIcon fontSize="large" />}
        app={APP_NAMES.recorder}
        onClick={() => {
          handleClickApp(APP_NAMES.recorder);
        }}
        isScale={isScale}
      />
      <HeaderIcon
        icon={<CameraAltOutlinedIcon fontSize="large" />}
        app={APP_NAMES.camera}
        onClick={() => {
          handleClickApp(APP_NAMES.camera);
        }}
        isScale={isScale}
      />

      {activeApp !== APP_NAMES.null && (
        <HeaderIcon
          icon={<CloseIcon fontSize="large" />}
          app={APP_NAMES.null}
          onClick={() => {
            handleClickApp(APP_NAMES.null);
          }}
        />
      )}
    </Container>
  );
}
