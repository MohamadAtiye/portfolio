import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { VisualiserClass } from "./helpers/VisualiserClass";
import AudioRecorder from "./components/AudioRecorder";
import AudioPlayer from "./components/AudioPlayer";

export default function Recorder() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current)
      VisualiserClass.setVisualiserCanvas(canvasRef.current);
  }, []);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <AudioRecorder />
      <canvas
        ref={canvasRef}
        width="1000"
        height="100"
        style={{ background: "rgb(200, 200, 200)" }}
      ></canvas>
      <AudioPlayer />
    </Box>
  );
}
