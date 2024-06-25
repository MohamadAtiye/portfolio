import { Box } from "@mui/material";
import TimeNow from "./components/TimeNow";

export default function Time() {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        overflowY: "auto",
      }}
    >
      <TimeNow />
    </Box>
  );
}
