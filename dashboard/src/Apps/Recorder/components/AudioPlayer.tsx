import { useEffect, useState } from "react";
import {
  MediaRecording,
  PlayerClass,
  PlayerStatus,
} from "../helpers/PlayerClass";
import { Box, Typography } from "@mui/material";
import { PauseButton, PlayButton } from "./MediaButtons";
import RecordingEntry from "./RecordingEntry";

export default function AudioPlayer() {
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>(
    PlayerStatus.idle
  );
  const [recordings, setRecordings] = useState<MediaRecording[]>([]);

  useEffect(() => {
    PlayerClass.subscribeOnStatusChange(
      (status: PlayerStatus, recordingsList: MediaRecording[]) => {
        console.log({ status, recordingsList });
        setPlayerStatus(status);
        setRecordings(recordingsList);
      }
    );
  }, []);

  return (
    <>
      <Typography sx={{ textAlign: "center", fontSize: "1.5rem" }}>
        Player
      </Typography>
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        {(playerStatus === PlayerStatus.ready ||
          playerStatus === PlayerStatus.paused) && (
          <PlayButton onClick={PlayerClass.playRecording} isDisabled={false} />
        )}
        <PauseButton onClick={PlayerClass.pauseRecording} isDisabled={false} />
      </Box>
      <Typography>Recordings:</Typography>
      {recordings.map((r) => (
        <RecordingEntry r={r} key={r.id} />
      ))}
    </>
  );
}
