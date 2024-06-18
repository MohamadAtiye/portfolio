import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import { msToTime } from "../helpers/RecorderClass";
import { MediaRecording, PlayerClass } from "../helpers/PlayerClass";
// import SaveAltIcon from "@mui/icons-material/SaveAlt";

interface RecordingEntryProps {
  r: MediaRecording;
}
export default function RecordingEntry({ r }: RecordingEntryProps) {
  // function download() {
  //   const url = r.audioUrl;
  //   const a = document.createElement("a");
  //   a.style.display = "none";
  //   a.href = url;
  //   // Suggest a filename for the download
  //   a.download = r.name || "recording.wav"; // Use the correct file extension
  //   document.body.appendChild(a);
  //   a.click();
  //   URL.revokeObjectURL(url);
  //   document.body.removeChild(a);
  // }
  return (
    <ListItem disablePadding>
      <ListItemButton onClick={() => PlayerClass.selectRecording(r.id)}>
        <ListItemText
          primary={`recording ${r.name}`}
          secondary={`${msToTime(r.time)}`}
        />
      </ListItemButton>
    </ListItem>
  );
}
