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
      setRecorderStatus(status);
    });

    if (timerRef.current) {
      RecorderClass.setTimerEl(timerRef.current);
    }

    return () => {
      console.log("trigger cleanup");
      RecorderClass.stopRecording();
    };
  }, []);

  return (
    <>
      <Box
        sx={{
          border: "1px solid black",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            width: "200px",
          }}
        >
          <Typography sx={{ textAlign: "center", fontSize: "1.5rem" }}>
            {recorderStatus}
          </Typography>
          <Typography
            ref={timerRef}
            sx={{ fontSize: "2rem", textAlign: "center" }}
          >
            00:00:000
          </Typography>
        </Box>
        <Box
          sx={{
            width: "200px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
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
      </Box>
    </>
  );
}
