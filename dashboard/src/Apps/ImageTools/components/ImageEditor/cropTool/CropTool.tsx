import { Box } from "@mui/material";
import CropCanvas from "./CropCanvas";
import CropControl from "./CropControl";
import CurrentImg from "../CurrentImg";

export default function CropTool() {
  return (
    <>
      <Box
        sx={{
          border: "3px dashed gray",
          cursor: "pointer",
          flex: 1,
          width: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <CurrentImg />
        <CropCanvas />
      </Box>
      <CropControl />
    </>
  );
}
