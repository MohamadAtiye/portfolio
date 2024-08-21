import { Button } from "@mui/material";
import { Box } from "@mui/system";

interface CaptureButtonBoxProps {
  handleScreenshot: () => void;
}
export default function CaptureButtonBox({
  handleScreenshot,
}: CaptureButtonBoxProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Button variant="contained" size="small" onClick={handleScreenshot}>
        Capture
      </Button>
    </Box>
  );
}
