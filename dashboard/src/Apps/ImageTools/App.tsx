import { Box } from "@mui/material";
import ImageInfo from "./components/ImageInfo";
import { useData } from "./helpers/useData";
import ImageEditor from "./components/ImageEditor";
import ImagePicker from "./components/ImagePicker";

export default function App() {
  const { currentImage } = useData();
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* IMAGE PICKER OR EDITOR */}
      {currentImage ? <ImageEditor /> : <ImagePicker />}

      {/* SRC IMAGE INFO */}
      <ImageInfo />
    </Box>
  );
}
