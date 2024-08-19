import { Box } from "@mui/material";
import CropCanvas from "./CropCanvas";
import CurrentImg from "../CurrentImg";
import CropControl from "./CropControl";
import { useState } from "react";
import { ACTIONS, useData } from "../../helpers/useData";

export default function CropTool() {
  const { currentImage, submitChange, setActiveAction } = useData();
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  const applyCrop = async () => {
    if (!currentImage) return;

    const canvas = new OffscreenCanvas(crop.w, crop.h);
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(
      currentImage.img,
      crop.x,
      crop.y,
      crop.w,
      crop.h,
      0,
      0,
      crop.w,
      crop.h
    );

    const blob = await canvas.convertToBlob();
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      submitChange(dataUrl, "crop");
      setActiveAction(ACTIONS.none);
    };
    reader.readAsDataURL(blob);
  };

  return (
    <>
      <CropControl crop={crop} setCrop={setCrop} applyCrop={applyCrop} />
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
        <CropCanvas crop={crop} setCrop={setCrop} />
      </Box>
    </>
  );
}
