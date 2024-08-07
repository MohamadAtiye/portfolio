import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  Radio,
  RadioGroup,
  Slider,
  TextField,
} from "@mui/material";
import { useState } from "react";
import DropDownPopper from "../DropDownPopper";
import SettingsIcon from "@mui/icons-material/Settings";
import BgClear from "./backgrounds/BgClear";
import BgBlobs from "./backgrounds/BgBlobs";
// import BgSnowyDay from "./backgrounds/BgSnowyDay";

enum BACKGROUNDS {
  color = "color",
  blobs = "blobs",
  // snowyDay = "snowyDay",
}

export default function GlBackgroundManager() {
  const [selectedBG, setSelectedBG] = useState(BACKGROUNDS.blobs);
  const [bgColor, setBgColor] = useState("#9accff");

  const [blobOptions, setBlobOptions] = useState({
    blobsColor: "#BB00FF",
    blobsSize: 20,
    blobsSpeed: 2,
    blobsCount: 10,
  });

  return (
    <>
      <Box
        sx={{ position: "absolute", top: 0, left: 0, padding: 1, zIndex: 3000 }}
      >
        <DropDownPopper ButtonIcon={<SettingsIcon />}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* BG SELECTOR */}
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Background</FormLabel>
              <RadioGroup
                aria-label="background-selector"
                name="background-selector"
                value={selectedBG}
                onChange={(event) =>
                  setSelectedBG(event.target.value as BACKGROUNDS)
                }
              >
                {Object.keys(BACKGROUNDS).map((bg) => (
                  <FormControlLabel
                    key={bg}
                    value={bg}
                    control={<Radio size="small" />}
                    label={bg}
                  />
                ))}
              </RadioGroup>
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
                    max={100}
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
                    max={20}
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
      {/* {selectedBG === BACKGROUNDS.snowyDay && <BgSnowyDay />} */}
    </>
  );
}
