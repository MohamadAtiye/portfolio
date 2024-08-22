import { useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { PauseButton, RecordButton, StopButton } from "./MediaButtons";
import { msToTime } from "../../../helpers/utils";

enum RecorderStatus {
  idle = "idle",
  paused = "paused",
  recording = "recording",
}

interface AudioRecorderProps {
  addNewRecording: (audioUrl: string) => void;
}
export default function AudioRecorder({ addNewRecording }: AudioRecorderProps) {
  const recorderStatusRef = useRef(RecorderStatus.idle);
  const [recorderStatus, setRecorderStatus] = useState<RecorderStatus>(
    RecorderStatus.idle
  );
  const isRecording = recorderStatus === RecorderStatus.recording;

  ///////////////////////////////////-- time functions

  const timeRef = useRef(0);
  const oldTimeRef = useRef(0);
  const timerRef = useRef<HTMLSpanElement | null>(null);
  function countTime() {
    const now = Date.now();
    timeRef.current += now - oldTimeRef.current;
    oldTimeRef.current = now;

    if (recorderStatusRef.current !== RecorderStatus.recording) return;

    if (timerRef.current)
      timerRef.current.innerText = msToTime(timeRef.current);

    requestAnimationFrame(countTime);
  }
  function startTime() {
    timeRef.current = 0;
    oldTimeRef.current = Date.now();
    requestAnimationFrame(countTime);
  }
  function continueTime() {
    oldTimeRef.current = Date.now();
    requestAnimationFrame(countTime);
  }
  function clearTime() {
    timeRef.current = 0;
    if (timerRef.current)
      timerRef.current.innerText = msToTime(timeRef.current);
  }

  //////////////////////////////////-- handle buttons
  function handleStartPauseRecording() {
    // if starting new recording
    if (recorderStatus === RecorderStatus.idle) {
      // set recording status
      setRecorderStatus(RecorderStatus.recording);
      recorderStatusRef.current = RecorderStatus.recording;

      // start new recording
      startRecorder();

      // start fresh timer
      startTime();
    }
    // else if continue after pause
    else if (recorderStatus === RecorderStatus.paused) {
      // set recording status
      setRecorderStatus(RecorderStatus.recording);
      recorderStatusRef.current = RecorderStatus.recording;

      // continue old recoding
      continueRecorder();

      // continue timer
      continueTime();
    }
    // else is already recording, pause it
    else if (recorderStatus === RecorderStatus.recording) {
      // set recording status
      setRecorderStatus(RecorderStatus.paused);
      recorderStatusRef.current = RecorderStatus.paused;

      // pause recording
      pauseRecorder();
    }
  }
  function handleStopRecording() {
    // set status to idle
    setRecorderStatus(RecorderStatus.idle);
    recorderStatusRef.current = RecorderStatus.idle;

    // handle recording finished
    endRecorder();

    // stop timer
    clearTime();
  }

  //////////////////////////////////-- handle recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  async function startRecorder() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.start();
    startTranscription();
  }
  function pauseRecorder() {
    mediaRecorderRef.current?.pause();
  }
  function continueRecorder() {
    mediaRecorderRef.current?.resume();
  }
  function endRecorder() {
    if (!mediaRecorderRef.current) return;

    handleStopListening();

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream
      .getTracks()
      .forEach((track) => track.stop());

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      addNewRecording(audioUrl);
      // const audio = new Audio(audioUrl);
      // audio.play();
      audioChunksRef.current = [];
    };
  }

  //////////////////////////////////-- handle transcription

  const [transcript, setTranscript] = useState("");
  function startTranscription() {
    setTranscript("");
  }

  const handleStopListening = () => {};

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
        {/* STATUS AND TIME */}
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

        {/* CONTROLS */}
        <Box
          sx={{
            width: "200px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <StopButton
            onClick={handleStopRecording}
            isDisabled={
              recorderStatus !== RecorderStatus.recording &&
              recorderStatus !== RecorderStatus.paused
            }
          />
          {!isRecording ? (
            <RecordButton
              onClick={handleStartPauseRecording}
              isDisabled={isRecording}
            />
          ) : (
            <PauseButton
              onClick={handleStartPauseRecording}
              isDisabled={!isRecording}
            />
          )}
        </Box>
      </Box>
      {/* TRANSCRIBE */}
      <Box>
        <Typography variant="caption">{transcript}</Typography>
      </Box>
    </>
  );
}
