import { Box } from "@mui/material";
import Header from "./components/Header";
import PagePaper from "./components/PagePaper";
import { useDashboard } from "./hooks/useDashboard";
import Todo from "./Apps/Todo/Todo";
import Time from "./Apps/Time/Time";
import Recorder from "./Apps/Recorder/Recorder";
import { APP_NAMES } from "./assets/constants";
import StopWatch from "./Apps/StopWatch/StopWatch";
import Camera from "./Apps/Camera/Camera";
import WhiteboardSVG from "./Apps/Whiteboard/WhiteboardSVG";
import Calculator from "./Apps/Calculator/Calculator";
import GlBackgroundManager from "./components/GlBackgroundManager/GlBackgroundManager";

function App() {
  const { activeApp } = useDashboard();

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
      <GlBackgroundManager />

      <Header />

      {activeApp !== APP_NAMES.null && (
        <PagePaper>
          {activeApp === "todo" && <Todo />}
          {activeApp === "time" && <Time />}
          {activeApp === "recorder" && <Recorder />}
          {activeApp === "stopwatch" && <StopWatch />}
          {activeApp === "camera" && <Camera />}
          {activeApp === "whiteboard" && <WhiteboardSVG />}
          {activeApp === "calculator" && <Calculator />}
        </PagePaper>
      )}
    </Box>
  );
}

export default App;
