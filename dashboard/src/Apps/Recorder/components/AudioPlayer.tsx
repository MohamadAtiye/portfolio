import { useEffect, useRef, useState } from "react";
import { MediaRecording, PlayerClass } from "../helpers/PlayerClass";
import { Box, List, Typography } from "@mui/material";
import RecordingEntry from "./RecordingEntry";

export default function AudioPlayer() {
  const [recordings, setRecordings] = useState<MediaRecording[]>([]);
  const timerRef = useRef<HTMLSpanElement | null>(null);
  const trackNameRef = useRef<HTMLSpanElement | null>(null);
  const playerDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (trackNameRef.current && playerDivRef.current && timerRef.current)
      PlayerClass.setHtmlElements(
        trackNameRef.current,
        timerRef.current,
        playerDivRef.current
      );

    PlayerClass.subscribeOnStatusChange((recordingsList: MediaRecording[]) => {
      setRecordings([...recordingsList]);
    });

    return () => {
      PlayerClass.cleanup();
    };
  }, []);

  return (
    <>
      <Typography sx={{ textAlign: "center", fontSize: "1.5rem" }}>
        Player
      </Typography>
      <Box
        sx={{
          border: "1px solid black",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            width: "300px",
          }}
        >
          <Typography
            ref={trackNameRef}
            sx={{ textAlign: "center", fontSize: "1.5rem" }}
          >
            no track selected
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
            width: "300px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: "8px",
          }}
          ref={playerDivRef}
        ></Box>
      </Box>

      <Typography>Recordings:</Typography>
      <List sx={{ overflowY: "auto" }}>
        {recordings.map((r) => (
          <RecordingEntry r={r} key={r.id} />
        ))}
      </List>
    </>
  );
}
