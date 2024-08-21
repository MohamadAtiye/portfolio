import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useData } from "../helpers/useData";
import { useEffect, useMemo, useState } from "react";
import { formatFileSize } from "../helpers/utils";

const imageDataUrlToCanvas = (
  imageDataUrl: string
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve) => {
    // Create an image element
    const img = new Image();
    img.src = imageDataUrl;

    img.onload = () => {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);

      resolve(canvas);
    };
  });
};
const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Convert the canvas to a Blob in JPEG format
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject();
        resolve(blob);
      },
      type,
      quality / 100
    );
  });
};

export default function ImageExport() {
  const { currentImage } = useData();

  const info = useMemo(() => {
    const w = currentImage?.img.naturalWidth; // Get the original width
    const h = currentImage?.img.naturalHeight; // Get the original height
    return {
      w,
      h,
    };
  }, [currentImage]);

  const [type, setType] = useState("image/jpeg");
  const typeOptions = ["image/jpeg", "image/png", "image/webp"];

  const [quality, setQuality] = useState(80);
  const qualityOptions = Array.from({ length: 10 }, (_, i) => (i + 1) * 10);

  const [size, setSize] = useState(0);

  const [displayImg, setDisplayImg] = useState<string>();

  // calculate export size
  useEffect(() => {
    const imageDataUrl = currentImage?.imageDataUrl;
    if (!imageDataUrl) return;

    imageDataUrlToCanvas(imageDataUrl)
      .then((canvas) => {
        setDisplayImg(canvas.toDataURL(type, quality));
        return canvasToBlob(canvas, type, quality);
      })
      .then((blob) => {
        setSize(blob.size);
      });
  }, [currentImage?.imageDataUrl, quality, type]);

  function downloadImage(fileName: string) {
    const imageDataUrl = currentImage?.imageDataUrl;
    if (!imageDataUrl) return;

    imageDataUrlToCanvas(imageDataUrl)
      .then((canvas) => {
        return canvasToBlob(canvas, type, quality);
      })
      .then((blob) => {
        // Create a link element
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;

        // Programmatically click the link to trigger the download
        link.click();

        // Clean up
        URL.revokeObjectURL(link.href);
      });
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          padding: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography>Destination Image:</Typography>
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              downloadImage("test.jpeg");
            }}
          >
            Download
          </Button>
        </Box>

        {/* IMAGE TYPE */}
        <Box sx={{ display: "flex", flexDirection: "column", width: "150px" }}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="step-select-label">Select Type</InputLabel>
            <Select
              labelId="step-select-label"
              value={type}
              onChange={(event) => {
                setType(event.target.value);
              }}
              label="Select Value"
            >
              {typeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* IMAGE QUALITY */}
        {type !== "image/png" && (
          <Box
            sx={{ display: "flex", flexDirection: "column", width: "150px" }}
          >
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="step-select-label">Select Quality</InputLabel>
              <Select
                labelId="step-select-label"
                value={quality}
                onChange={(event) => {
                  setQuality(event.target.value as number);
                }}
                label="Select Value"
              >
                {qualityOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}%
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography>Size</Typography>
          <Typography>{formatFileSize(size)}</Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography>Dims</Typography>
          <Typography>
            w:{info.w}, h:{info.h}
          </Typography>
        </Box>
      </Box>

      <Typography align="center">Export Preview</Typography>
      <Box
        sx={{
          flex: 1,
          width: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src={displayImg}
          style={{
            objectFit: "contain",
            minWidth: "350px",
            position: "absolute",
            top: 0,
            left: 0,

            height: `100%`,
            width: `100%`,
          }}
        />
      </Box>
    </>
  );
}
