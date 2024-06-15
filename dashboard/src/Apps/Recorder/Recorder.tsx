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
  msToTime,
} from "./helpers/AudioRecorder";

export default function Recorder() {
  const [recorderStatus, setRecorderStatus] = useState<RecorderStatus>(
    RecorderStatus.idle
  );
  const [recordings, setRecordings] = useState<MediaRecording[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<HTMLSpanElement | null>(null);

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

    if (timerRef.current) {
      AudioRecorder.setTimerEl(timerRef.current);
    }
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
      <Typography ref={timerRef} sx={{ fontSize: "2rem", textAlign: "center" }}>
        00:00:00
      </Typography>

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
        <Typography key={r.id}>
          recording {i+1}, duration: {msToTime(r.time)}
        </Typography>
      ))}
    </Box>
  );
}
