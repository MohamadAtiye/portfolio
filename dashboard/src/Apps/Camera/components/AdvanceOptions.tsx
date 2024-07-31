import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

interface SettingsInputRangeProps {
  min: number;
  max: number;
  step: number;
  value: number;
  handleChange: (v: number) => void;
}
function SettingsInputRange({
  min,
  max,
  step,
  value,
  handleChange,
}: SettingsInputRangeProps) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ display: "inline-block", width: "35px" }}
      >
        {Math.floor(min)}
      </Typography>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        // Add onChange handler as needed
        value={value}
        onChange={(e) => handleChange(Number(e.target.value))}
      />
      <Typography
        variant="caption"
        sx={{ display: "inline-block", width: "35px" }}
      >
        {Math.ceil(max)}
      </Typography>
      ={value}
    </Box>
  );
}

interface AdvanceOptionsProps {
  settings: MediaTrackSettings;
  capabilities: MediaTrackCapabilities;
  setAdvancedOptions: (advanced: MediaTrackSettings) => void;
}
export default function AdvanceOptions({
  settings,
  capabilities,
  setAdvancedOptions,
}: AdvanceOptionsProps) {
  const [updated, setUpdated] = useState(settings);
  useEffect(() => {
    setUpdated(settings);
  }, [settings]);

  const [caps, setCaps] = useState(capabilities);
  useEffect(() => {
    const newCaps = { ...capabilities };
    delete newCaps.height;
    delete newCaps.width;
    delete newCaps.aspectRatio;
    delete newCaps.deviceId;
    delete newCaps.groupId;
    setCaps(newCaps);
  }, [capabilities]);

  return (
    <Box>
      <table style={{ margin: "0 auto" }}>
        <tbody>
          {Object.entries(caps).map((item) => {
            const controlValue = item[1];

            // Check if it's an object with min, max, and step properties
            if (
              typeof controlValue === "object" &&
              "min" in controlValue &&
              "max" in controlValue
              // && "step" in controlValue
            ) {
              // Render a range bar (slider)
              return (
                <tr key={item[0]}>
                  <td>{item[0]}</td>
                  <td>
                    <SettingsInputRange
                      min={controlValue.min}
                      max={controlValue.max}
                      step={controlValue.step ?? 1}
                      // Add onChange handler as needed
                      value={parseInt(updated[item[0]])}
                      handleChange={(v: number) =>
                        setUpdated((p) => ({ ...p, [item[0]]: v }))
                      }
                    />
                  </td>
                </tr>
              );
            } else if (Array.isArray(controlValue)) {
              // Render radio buttons for an array of strings
              return (
                <tr key={item[0]}>
                  <td>{item[0]}</td>
                  <td>
                    <FormControl component="fieldset">
                      <RadioGroup
                        row
                        aria-label="radio-group"
                        name="radio-group"
                        value={updated[item[0]]}
                        onChange={(event) => {
                          setUpdated((p) => ({
                            ...p,
                            [item[0]]: event.target.value,
                          }));
                        }}
                      >
                        {controlValue.map((option) => (
                          <FormControlLabel
                            key={option}
                            value={option}
                            control={<Radio />}
                            label={option}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </td>
                </tr>
              );
            } else {
              // Fallback: Just display the value as a string
              return (
                <tr key={item[0]}>
                  <td>{item[0]}</td>
                  <td>{JSON.stringify(controlValue)}</td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Button onClick={() => setUpdated(settings)}>Reset</Button>
        <Button onClick={() => setAdvancedOptions(updated)}>Apply</Button>
      </Box>
    </Box>
  );
}
