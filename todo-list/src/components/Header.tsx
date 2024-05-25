import { Typography } from "@mui/material";

export default function Header() {
  return (
    <Typography
      variant="h1"
      style={{
        textAlign: "center",
        fontSize: "2rem",
        padding: "1rem 0",
        textShadow: "2px 2px 1px white",
      }}
    >
      TODO LIST
    </Typography>
  );
}
