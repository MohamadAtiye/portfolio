import { Typography } from "@mui/material";

interface SubHeaderProps {
  text: string;
}
export default function SubHeader({ text }: SubHeaderProps) {
  return (
    <Typography
      variant="h2"
      style={{
        textAlign: "center",
        fontSize: "1.5rem",
        padding: "0.5rem 0",
      }}
    >
      {text}
    </Typography>
  );
}
