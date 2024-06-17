import { IconButton, Typography } from "@mui/material";
import { MediaRecording, msToTime } from "../helpers/RecorderClass";
import SaveAltIcon from "@mui/icons-material/SaveAlt";

interface RecordingEntryProps {
  r: MediaRecording;
}
export default function RecordingEntry({ r }: RecordingEntryProps) {
  function download() {
    const url = r.audioUrl;
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    // Suggest a filename for the download
    a.download = r.name || "recording.wav"; // Use the correct file extension
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  return (
    <Typography>
      recording {r.name}, duration: {msToTime(r.time)}
      <IconButton aria-label="download" onClick={download}>
        <SaveAltIcon />
      </IconButton>
    </Typography>
  );
}
