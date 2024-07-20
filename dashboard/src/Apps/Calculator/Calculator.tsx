import React from "react";
import { Box } from "@mui/material";
import NormalCalculator from "./components/NormalCalculator";

const Calculator: React.FC = () => {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      TODO: handle Percent % 
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        {/* normal calculator */}
        <NormalCalculator />
      </Box>
    </Box>
  );
};

export default Calculator;
