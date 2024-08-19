import { Box, Button } from "@mui/material";
import { ACTIONS, useData } from "../helpers/useData";
import CropTool from "./ImageEditor/cropTool/CropTool";
import CurrentImg from "./ImageEditor/CurrentImg";
import ImageHistory from "./ImageHistory";
import ImageExport from "./ImageExport";
// import CropControl from "./ImageEditor/cropTool/CropControl";

const ImageEditor = () => {
  const { activeAction, setActiveAction } = useData();

  const updateAction = (newAction: ACTIONS) => {
    setActiveAction(activeAction === newAction ? ACTIONS.none : newAction);
  };

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* MAIN CONTROLS */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          size="small"
          variant={activeAction === ACTIONS.crop ? "contained" : "outlined"}
          onClick={() => {
            updateAction(ACTIONS.crop);
          }}
        >
          Crop
        </Button>
        {/* <Button
          size="small"
          variant={activeAction === ACTIONS.resize ? "contained" : "outlined"}
          onClick={() => {
            updateAction(ACTIONS.resize);
          }}
        >
          Resize
        </Button> */}
        <Button
          size="small"
          variant={activeAction === ACTIONS.history ? "contained" : "outlined"}
          onClick={() => {
            updateAction(ACTIONS.history);
          }}
        >
          History
        </Button>
        <Button
          size="small"
          variant={activeAction === ACTIONS.export ? "contained" : "outlined"}
          onClick={() => {
            updateAction(ACTIONS.export);
          }}
        >
          Export
        </Button>
      </Box>

      {/* IMAGE AND CANVAS DISPLAY */}
      <Box
        sx={{
          border: "1px solid black",
          flex: 1,
          width: "100%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeAction === ACTIONS.none && <CurrentImg />}
        {activeAction === ACTIONS.crop && <CropTool />}
        {activeAction === ACTIONS.history && <ImageHistory />}
        {activeAction === ACTIONS.export && <ImageExport />}
      </Box>
    </Box>
  );
};

export default ImageEditor;
