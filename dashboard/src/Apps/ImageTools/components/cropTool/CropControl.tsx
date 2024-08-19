import { Box, Button, TextField } from "@mui/material";
import { useData } from "../../helpers/useData";
import { useEffect, useRef, useState } from "react";

interface CropControlProps {
  crop: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  setCrop: (val: { x: number; y: number; w: number; h: number }) => void;
  applyCrop: () => void;
}
export default function CropControl({
  crop,
  setCrop,
  applyCrop,
}: CropControlProps) {
  const { currentImage } = useData();
  const [cropMode, setCropMode] = useState("manual");

  useEffect(() => {
    changeCropMode("manual");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cropModeRef = useRef(cropMode);
  const changeCropMode = (val: string) => {
    setCropMode(val);
    cropModeRef.current = val;

    if (!currentImage) return;
    const imgW = currentImage.img.naturalWidth;
    const imgH = currentImage.img.naturalHeight;
    handleManualChange(imgW, imgH);
  };

  // copy crop to ref to avoid rerender
  const cropRef = useRef(crop);
  useEffect(() => {
    cropRef.current = crop;
  }, [crop]);

  const handleManualChange = (newW: number, newH: number, dim?: "h" | "w") => {
    if (!currentImage) return;
    const imgW = currentImage.img.naturalWidth;
    const imgH = currentImage.img.naturalHeight;

    // check horizontal  borders
    if (newW < 0) newW = 0;
    else if (newW > imgW) newW = imgW;

    // check vertical  borders
    if (newH < 0) newH = 0;
    else if (newH > imgH) newH = imgH;

    // apply ratio
    if (cropModeRef.current !== "manual") {
      // get ratio
      const [tw, th] = cropModeRef.current.split("/").map(Number);
      const ratio = tw / th;

      // if changed crop mode
      if (!dim) {
        // Adjust both dimensions to maintain aspect ratio
        if (imgW / ratio > imgH) {
          newH = imgH;
          newW = Math.round(imgH * ratio);
        } else {
          newW = imgW;
          newH = Math.round(imgW / ratio);
        }
      }
      // else manually changing width/height
      else {
        // Adjust one dimension based on the other
        if (dim === "w") {
          newH = Math.round(newW / ratio);
          if (newH > imgH) {
            newH = imgH;
            newW = Math.round(imgH * ratio);
          }
        } else {
          newW = Math.round(newH * ratio);
          if (newW > imgW) {
            newW = imgW;
            newH = Math.round(imgW / ratio);
          }
        }
      }
    }

    // Ensure crop position is within image bounds
    let newX = cropRef.current.x;
    let newY = cropRef.current.y;
    newX = Math.max(0, Math.min(newX, imgW - newW));
    newY = Math.max(0, Math.min(newY, imgH - newH));

    setCrop({ w: newW, h: newH, x: newX, y: newY });
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          padding: 1,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant={cropMode === "manual" ? "contained" : "outlined"}
          onClick={() => changeCropMode("manual")}
        >
          manual
        </Button>
        <Button
          variant={cropMode === "16/9" ? "contained" : "outlined"}
          onClick={() => changeCropMode("16/9")}
        >
          16/9
        </Button>
        <Button
          variant={cropMode === "9/16" ? "contained" : "outlined"}
          onClick={() => changeCropMode("9/16")}
        >
          9/16
        </Button>
        <Button
          variant={cropMode === "4/3" ? "contained" : "outlined"}
          onClick={() => changeCropMode("4/3")}
        >
          4/3
        </Button>
        <Button
          variant={cropMode === "3/4" ? "contained" : "outlined"}
          onClick={() => changeCropMode("3/4")}
        >
          3/4
        </Button>

        <Button variant="contained" onClick={applyCrop} color="success">
          Apply
        </Button>
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          padding: 1,
          flexWrap: "wrap",
        }}
      >
        <TextField
          label={"width"}
          size="small"
          type="number"
          value={crop.w}
          onChange={(event) =>
            handleManualChange(Number(event.target.value), crop.h, "w")
          }
          sx={{ width: "80px" }}
        />
        <TextField
          label={"height"}
          size="small"
          type="number"
          value={crop.h}
          onChange={(event) =>
            handleManualChange(crop.w, Number(event.target.value), "h")
          }
          sx={{ width: "80px" }}
        />
      </Box>
    </>
  );
}
