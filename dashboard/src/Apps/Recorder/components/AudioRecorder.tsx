import { useEffect, useRef, useState } from "react";
import { RecorderClass, RecorderStatus } from "../helpers/RecorderClass";
import { Box, Typography } from "@mui/material";
import { PauseButton, RecordButton, StopButton } from "./MediaButtons";

export default function AudioRecorder() {
  const [recorderStatus, setRecorderStatus] = useState<RecorderStatus>(
    RecorderStatus.idle
  );
  const timerRef = useRef<HTMLSpanElement | null>(null);

  const isRecording = recorderStatus === RecorderStatus.recording;

  useEffect(() => {
    RecorderClass.subscribeOnStatusChange((status: RecorderStatus) => {
      console.log({ status });
      setRecorderStatus(status);
    });

    if (timerRef.current) {
      RecorderClass.setTimerEl(timerRef.current);
    }
  }, []);

  return (
    <>
      <Typography ref={timerRef} sx={{ fontSize: "2rem", textAlign: "center" }}>
        00:00:00
      </Typography>

      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <StopButton
          onClick={RecorderClass.stopRecording}
          isDisabled={
            recorderStatus !== RecorderStatus.recording &&
            recorderStatus !== RecorderStatus.paused
          }
        />
        {!isRecording ? (
          <RecordButton
            onClick={RecorderClass.startRecording}
            isDisabled={isRecording}
          />
        ) : (
          <PauseButton
            onClick={RecorderClass.pauseRecording}
            isDisabled={!isRecording}
          />
        )}
      </Box>
    </>
  );
}
