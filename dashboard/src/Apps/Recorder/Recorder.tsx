import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import {
  PauseButton,
  PlayButton,
  RecordButton,
  StopButton,
} from "./components/MediaButtons";
import { AudioVisualiser } from "./helpers/AudioVisualiser";
import {
  AudioRecorder,
  MediaRecording,
  RecorderStatus,
} from "./helpers/AudioRecorder";

export default function Recorder() {
  const [recorderStatus, setRecorderStatus] = useState<RecorderStatus>(
    RecorderStatus.idle
  );
  const [recordings, setRecordings] = useState<MediaRecording[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isRecording = recorderStatus === RecorderStatus.recording;

  useEffect(() => {
    if (canvasRef.current)
      AudioVisualiser.setVisualiserCanvas(canvasRef.current);
    AudioRecorder.subscribeOnStatusChange(
      (status: RecorderStatus, recordingsList: MediaRecording[]) => {
        console.log({ status, recordingsList });
        setRecorderStatus(status);
        setRecordings(recordingsList);
      }
    );
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
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <PlayButton
          onClick={AudioRecorder.playLastRecording}
          isDisabled={recorderStatus !== RecorderStatus.stopped}
        />
        <StopButton
          onClick={AudioRecorder.stopRecording}
          isDisabled={
            recorderStatus !== RecorderStatus.recording &&
            recorderStatus !== RecorderStatus.paused
          }
        />
        {!isRecording ? (
          <RecordButton
            onClick={AudioRecorder.startRecording}
            isDisabled={isRecording}
          />
        ) : (
          <PauseButton
            onClick={AudioRecorder.pauseRecording}
            isDisabled={!isRecording}
          />
        )}
      </Box>

      <canvas
        ref={canvasRef}
        width="1000"
        height="100"
        style={{ background: "rgb(200, 200, 200)" }}
      ></canvas>

      <Typography>Recordings:</Typography>
      {recordings.map((r, i) => (
        <Box key={r.id}>
          recording {i} {r.id}
        </Box>
      ))}
    </Box>
  );
}
