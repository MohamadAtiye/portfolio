import { Box } from "@mui/material";
import AudioRecorder from "./components/AudioRecorder";
import AudioPlayer from "./components/AudioPlayer";
import VisualiserVisualiser from "./components/VisualiserVisualiser";

export default function Recorder() {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        overflow: "hidden",
      }}
    >
      <AudioRecorder />
      <VisualiserVisualiser />
      <AudioPlayer />
    </Box>
  );
}


// TODO : add transcribe