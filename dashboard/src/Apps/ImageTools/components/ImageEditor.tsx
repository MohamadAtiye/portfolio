import { Box, Button } from "@mui/material";
import { ACTIONS, useData } from "../helpers/useData";
import CropTool from "./ImageEditor/cropTool/CropTool";
import CurrentImg from "./ImageEditor/CurrentImg";

const ImageEditor = () => {
  const { activeAction, setActiveAction } = useData();

  const updateAction = (newAction: ACTIONS) => {
    setActiveAction(activeAction === newAction ? ACTIONS.none : newAction);
  };

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* <Box sx={{ flex: 1 }}> */}
      <Box
        sx={{
          border: "1px solid black",
          // borderRadius: 4,
          cursor: "pointer",
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
      </Box>
      {/* </Box> */}

      {/* CONTROL BUTTONS */}
      {/* <Box
        sx={{
          padding: 2,
          alignItems: "center",
          display: "flex",
          border: "1px solid black",
        }}
      >
        <Button
          variant={activeAction === ACTIONS.crop ? "contained" : "outlined"}
          onClick={() => {
            updateAction(ACTIONS.crop);
          }}
        >
          Crop/Resize
        </Button>
      </Box> */}
    </Box>
  );
};

export default ImageEditor;
