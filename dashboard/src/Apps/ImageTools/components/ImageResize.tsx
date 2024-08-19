import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import CurrentImg from "./CurrentImg";
import { useEffect, useState } from "react";
import { ACTIONS, useData } from "../helpers/useData";

export default function ImageResize() {
  const { currentImage, submitChange, setActiveAction } = useData();

  const [resizeMode, setResizeMode] = useState("toPercent");
  const [toValue, setToValue] = useState({ w: 100, h: 100, p: 100 });

  // set initial values
  useEffect(() => {
    if (!currentImage) return;
    const imgW = currentImage.img.naturalWidth;
    const imgH = currentImage.img.naturalHeight;
    setToValue({ w: imgW, h: imgH, p: 100 });
  }, [currentImage]);

  const handleChange = (value: number, dim: "w" | "h" | "p") => {
    if (!currentImage) return;
    const imgW = currentImage.img.naturalWidth;
    const imgH = currentImage.img.naturalHeight;
    const R = imgW / imgH;

    // handle non zero for all
    if (value < 1) value = 1;

    if (dim === "p") {
      const newP = Math.min(value, 100);
      const newW = Math.round((value * imgW) / 100);
      const newH = Math.round((value * imgH) / 100);
      setToValue({ w: newW, h: newH, p: newP });
    } else if (dim === "w") {
      const newP = Math.round((100 * value) / imgW);
      const newW = Math.min(value, imgW);
      const newH = Math.round(newW / R);
      setToValue({ w: newW, h: newH, p: newP });
    } else if (dim === "h") {
      if (value > imgH) value = imgH;
      const newP = Math.round((100 * value) / imgH);
      const newH = Math.min(value, imgH);
      const newW = Math.round(newH * R);

      setToValue({ w: newW, h: value, p: newP });
    }
  };

  const applyResize = async () => {
    if (!currentImage) return;

    const canvas = new OffscreenCanvas(toValue.w, toValue.h);
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(currentImage.img, 0, 0, toValue.w, toValue.h);

    const blob = await canvas.convertToBlob();
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      submitChange(dataUrl, "resize");
      setActiveAction(ACTIONS.none);
    };
    reader.readAsDataURL(blob);
  };

  return (
    <>
      <Box
        sx={{
          padding: 1,
        }}
      >
        <FormControl
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
          }}
        >
          <FormLabel>Mode</FormLabel>
          <RadioGroup
            row
            aria-label="conversion"
            name="conversion"
            value={resizeMode}
            onChange={(event) => setResizeMode(event.target.value)}
          >
            <FormControlLabel
              value="toPercent"
              control={<Radio size="small" />}
              label="To Percent"
            />
            <FormControlLabel
              value="toPixels"
              control={<Radio size="small" />}
              label="To Pixels"
            />
          </RadioGroup>
        </FormControl>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            padding: 1,
            flexWrap: "wrap",
          }}
        >
          {resizeMode === "toPixels" && (
            <>
              <TextField
                label={`width px`}
                size="small"
                type="number"
                value={toValue.w}
                onChange={(event) =>
                  handleChange(Number(event.target.value), "w")
                }
                sx={{ width: "80px" }}
              />
              <TextField
                label={`height px`}
                size="small"
                type="number"
                value={toValue.h}
                onChange={(event) =>
                  handleChange(Number(event.target.value), "h")
                }
                sx={{ width: "80px" }}
              />
            </>
          )}

          {resizeMode === "toPercent" && (
            <TextField
              label={`percent`}
              size="small"
              type="number"
              value={toValue.p}
              onChange={(event) =>
                handleChange(Number(event.target.value), "p")
              }
              sx={{ width: "80px" }}
            />
          )}

          <Button variant="contained" onClick={applyResize} color="success">
            Apply
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          width: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <CurrentImg />
      </Box>
    </>
  );
}
