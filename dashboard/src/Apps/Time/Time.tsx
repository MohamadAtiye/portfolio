import { Box } from "@mui/material";
import Header from "./components/Header";
import TimeNow from "./components/TimeNow";

export default function Time() {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Header />
      <TimeNow />
    </Box>
  );
}
