import { Box } from "@mui/material";
import Header from "./components/Header";
import PagePaper from "./components/PagePaper";
import { useDashboard } from "./hooks/useDashboard";
import Todo from "./Apps/Todo/Todo";
import GLBackgroundSnow from "./components/GLBackgroundSnow";
import Time from "./Apps/Time/Time";
import GLBackgroundBlob from "./components/GLBackgroundBlob";
import Recorder from "./Apps/Recorder/Recorder";
import { APP_NAMES } from "./assets/constants";
import StopWatch from "./Apps/StopWatch/StopWatch";
import Camera from "./Apps/Camera/Camera";

function App() {
  const { activeApp } = useDashboard();

  const bg = Math.round(Math.random());

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: "0px 8px 16px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        gap: 1,
      }}
    >
      {bg === 0 && <GLBackgroundSnow />}
      {bg === 1 && <GLBackgroundBlob />}

      <Header />

      {activeApp !== APP_NAMES.null && (
        <PagePaper>
          {activeApp === "todo" && <Todo />}
          {activeApp === "time" && <Time />}
          {activeApp === "recorder" && <Recorder />}
          {activeApp === "stopwatch" && <StopWatch />}
          {activeApp === "camera" && <Camera />}
        </PagePaper>
      )}
    </Box>
  );
}

export default App;
