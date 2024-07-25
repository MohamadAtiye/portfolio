import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
} from "@mui/material";
import { useState } from "react";
import DropDownPopper from "../DropDownPopper";
import SettingsIcon from "@mui/icons-material/Settings";
import BgClear from "./backgrounds/BgClear";
import BgBlobs from "./backgrounds/BgBlobs";

enum BACKGROUNDS {
  color = "color",
  blobs = "blobs",
  snowyDay = "snowyDay",
}

export default function GlBackgroundManager() {
  const [selectedBG, setSelectedBG] = useState(BACKGROUNDS.blobs);
  const [bgColor, setBgColor] = useState("#9accff");

  const [blobOptions, setBlobOptions] = useState({
    blobsColor: "#FFFFFF",
    blobsSize: 5,
    blobsSpeed: 2,
    blobsCount: 5,
  });

  return (
    <>
      <Box
        sx={{ position: "absolute", top: 0, left: 0, padding: 1, zIndex: 999 }}
      >
        <DropDownPopper ButtonIcon={<SettingsIcon />}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* BG SELECTOR */}
            <FormControl fullWidth>
              <InputLabel id="background-selector-label">Background</InputLabel>
              <Select
                labelId="background-selector-label"
                id="background-selector"
                value={selectedBG}
                label="Background"
                onChange={(event) =>
                  setSelectedBG(event.target.value as BACKGROUNDS)
                }
                size="small"
              >
                {Object.keys(BACKGROUNDS).map((bg) => (
                  <MenuItem value={bg} key={bg}>
                    {bg}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* MAIN BG COLOR */}
            <FormControl fullWidth>
              <TextField
                type="color"
                size="small"
                label="BG Color"
                id="background-color-selector"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </FormControl>

            {/* BLOB BG OPTIONS */}
            {selectedBG === BACKGROUNDS.blobs && (
              <Box>
                {/* Blob Color */}
                <FormControl fullWidth>
                  <TextField
                    type="color"
                    size="small"
                    label="Blob Color"
                    id="blob-color-selector"
                    value={blobOptions.blobsColor}
                    onChange={(e) =>
                      setBlobOptions((p) => ({
                        ...p,
                        blobsColor: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                {/* BLOB SIZE */}
                <Box>
                  <InputLabel id="blobsSize-label">Blobs Size</InputLabel>
                  <Slider
                    value={blobOptions.blobsSize}
                    onChange={(_event, newValue) =>
                      setBlobOptions((p) => ({
                        ...p,
                        blobsSize: newValue as number,
                      }))
                    }
                    aria-labelledby="blobsSize-label"
                    step={1}
                    min={1}
                    max={10}
                  />
                  {/* BLOB Speed */}
                  <InputLabel id="blobsSpeed-label">Blobs Speed</InputLabel>
                  <Slider
                    value={blobOptions.blobsSpeed}
                    onChange={(_event, newValue) =>
                      setBlobOptions((p) => ({
                        ...p,
                        blobsSpeed: newValue as number,
                      }))
                    }
                    aria-labelledby="blobsSpeed-label"
                    step={1}
                    min={1}
                    max={10}
                  />
                  {/* BLOB Count */}
                  <InputLabel id="blobsCount-label">Blobs Count</InputLabel>
                  <Slider
                    value={blobOptions.blobsCount}
                    onChange={(_event, newValue) =>
                      setBlobOptions((p) => ({
                        ...p,
                        blobsCount: newValue as number,
                      }))
                    }
                    aria-labelledby="blobsCount-label"
                    step={1}
                    min={1}
                    max={10}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </DropDownPopper>
      </Box>

      {selectedBG === BACKGROUNDS.color && <BgClear color={bgColor} />}
      {selectedBG === BACKGROUNDS.blobs && (
        <BgBlobs
          bgColor={bgColor}
          blobsColor={blobOptions.blobsColor}
          blobsSize={blobOptions.blobsSize}
          blobsSpeed={blobOptions.blobsSpeed}
          blobsCount={blobOptions.blobsCount}
        />
      )}
    </>
  );
}
