import { Button, Container, Paper, Typography } from "@mui/material";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DrawIcon from "@mui/icons-material/Draw";
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
        transform: isScale ? "scale(1.5)" : "scale(0.1)", // Scale the SVG on hover
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
  const [transitionTo, setTransitionTo] = useState<APP_NAMES>(activeApp);

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
    setTransitionTo(v);
  };

  const isScale = transitionTo === APP_NAMES.null;

  return (
    <Container
      sx={{
        height: isScale ? "50vh" : "72px",
        transition: "height 0.5s ease-out",
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        bgcolor: "rgba(255,255,255,0.2)",
        borderRadius: "0 0 20px 20px",
        gap: isScale ? 4 : 1,
        flexWrap: "wrap",
        position: "relative",
      }}
      component={Paper}
    >
      {activeApp === APP_NAMES.null && (
        <>
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
          <HeaderIcon
            icon={<DrawIcon fontSize="large" />}
            app={APP_NAMES.whiteboard}
            onClick={() => {
              handleClickApp(APP_NAMES.whiteboard);
            }}
            isScale={isScale}
          />
        </>
      )}

      {activeApp !== APP_NAMES.null && (
        <>
          <Typography fontSize={"1.5rem"}>{APPS[activeApp].text}</Typography>

          <Button
            sx={{
              position: "absolute",
              right: "16px",
              top: "6px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: "80px",
              ":hover": {
                "& svg": {
                  transform: "scale(1.2)", // Scale the SVG on hover
                },
              },
              color: "black",
            }}
            onClick={() => {
              handleClickApp(APP_NAMES.null);
            }}
          >
            <CloseIcon fontSize="large" />
            <Typography fontSize={10}>{APPS[APP_NAMES.null].text}</Typography>
          </Button>
        </>
      )}
    </Container>
  );
}
