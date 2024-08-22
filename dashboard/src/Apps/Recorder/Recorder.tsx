import { Box } from "@mui/material";
import AudioRecorder from "./components/AudioRecorder";
// import AudioPlayer from "./components/AudioPlayer";
// import VisualiserVisualiser from "./components/VisualiserVisualiser";
import { useState } from "react";

export default function Recorder() {
  const [audioRecordings, setAudioRecordings] = useState<
    { audioUrl: string; id: number }[]
  >([]);
  const addNewRecording = (audioUrl: string) => {
    console.log(audioUrl);
    setAudioRecordings((p) => [...p, { audioUrl, id: audioRecordings.length }]);
  };

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
      TODO : add transcribe
      <AudioRecorder addNewRecording={addNewRecording} />
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {audioRecordings.map((a) => (
          <Box key={`rec${a.id}`}>
            recording {a.id}:<br />
            <audio src={a.audioUrl} controls />
          </Box>
        ))}
      </Box>
      {/* <VisualiserVisualiser /> */}
      {/* <AudioPlayer /> */}
    </Box>
  );
}
