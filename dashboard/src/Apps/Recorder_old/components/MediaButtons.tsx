import { IconButton } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

interface ButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
  isDisabled?: boolean;
}
export function RecordButton({ onClick, isDisabled }: ButtonProps) {
  return (
    <IconButton
      sx={{
        color: "red",
        "&:hover": {
          bgcolor: "rgba(255, 0, 0, 0.1)",
        },
      }}
      aria-label="record"
      size="large"
      onClick={onClick}
      disabled={isDisabled}
    >
      <FiberManualRecordIcon sx={{ fontSize: "3rem" }} />
    </IconButton>
  );
}

export function PauseButton({ onClick, isDisabled }: ButtonProps) {
  return (
    <IconButton
      sx={{
        color: "black",
        "&:hover": {
          bgcolor: "rgba(0, 0, 0, 0.1)",
        },
      }}
      aria-label="pause"
      size="large"
      onClick={onClick}
      disabled={isDisabled}
    >
      <PauseIcon sx={{ fontSize: "3rem" }} />
    </IconButton>
  );
}
export function StopButton({ onClick, isDisabled }: ButtonProps) {
  return (
    <IconButton
      sx={{
        color: "red",
        "&:hover": {
          bgcolor: "rgba(255, 0, 0, 0.1)",
        },
      }}
      aria-label="stop"
      size="large"
      onClick={onClick}
      disabled={isDisabled}
    >
      <StopIcon sx={{ fontSize: "3rem" }} />
    </IconButton>
  );
}
export function PlayButton({ onClick, isDisabled }: ButtonProps) {
  return (
    <IconButton
      sx={{
        color: "black",
        "&:hover": {
          bgcolor: "rgba(0, 0, 0, 0.1)",
        },
      }}
      aria-label="play"
      size="large"
      onClick={onClick}
      disabled={isDisabled}
    >
      <PlayArrowIcon sx={{ fontSize: "3rem" }} />
    </IconButton>
  );
}
