import React, { useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useData } from "../helpers/useData";

const ImagePicker = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const { handleSelectNewFile } = useData();

  const handleNewImage = (file: File) => {
    if (file) {
      handleSelectNewFile(file);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleNewImage(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) handleNewImage(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (boxRef.current) boxRef.current.style.borderColor = "lime";
  };
  const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log("drag end");
    if (boxRef.current) boxRef.current.style.borderColor = "gray";
  };

  return (
    <Box
      ref={boxRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        border: "3px dashed gray",
        borderRadius: 4,
        bgcolor: "transparent",
        cursor: "pointer",
        height: "100%",
        width: "100%",
      }}
      onDragOver={onDragOver}
      onDrop={handleDrop}
      onDragLeave={onDragEnd}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
        id="image-input"
      />
      <label
        htmlFor="image-input"
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="textSecondary">
          Click to select an image or drag & drop here
        </Typography>
      </label>
    </Box>
  );
};

export default ImagePicker;
