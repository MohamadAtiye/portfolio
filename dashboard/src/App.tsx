import { Box } from "@mui/material";
import Header from "./components/Header";
import PagePaper from "./components/PagePaper";
import { useDashboard } from "./hooks/useDashboard";
import Todo from "./Apps/Todo/Todo";
import GLBackgroundSnow from "./components/GLBackgroundSnow";
import Time from "./Apps/Time/Time";
import GLBackgroundBlob from "./components/GLBackgroundBlob";
import Recorder from "./Apps/Recorder/Recorder";
import { APPS, APP_NAMES } from "./assets/constants";
import StopWatch from "./Apps/StopWatch/StopWatch";

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
        <PagePaper subheader={APPS[activeApp]?.text}>
          {activeApp === "todo" && <Todo />}
          {activeApp === "time" && <Time />}
          {activeApp === "recorder" && <Recorder />}
          {activeApp === "stopwatch" && <StopWatch />}
        </PagePaper>
      )}
    </Box>
  );
}

export default App;
