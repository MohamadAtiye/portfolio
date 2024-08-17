import { Box, Button } from "@mui/material";
import { useData } from "../../../helpers/useData";

export default function CropControl() {
  const { activeActionData, setActiveActionData } = useData();
  return (
    <Box sx={{ border: "1px solid black", padding: 2 }}>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Button
          variant={activeActionData === "manual" ? "contained" : "outlined"}
          onClick={() => setActiveActionData("manual")}
        >
          manual
        </Button>
        <Button
          variant={activeActionData === "16/9" ? "contained" : "outlined"}
          onClick={() => setActiveActionData("16/9")}
        >
          16/9
        </Button>
        <Button
          variant={activeActionData === "9/16" ? "contained" : "outlined"}
          onClick={() => setActiveActionData("9/16")}
        >
          9/16
        </Button>
        <Button
          variant={activeActionData === "4/3" ? "contained" : "outlined"}
          onClick={() => setActiveActionData("4/3")}
        >
          4/3
        </Button>
        <Button
          variant={activeActionData === "3/4" ? "contained" : "outlined"}
          onClick={() => setActiveActionData("3/4")}
        >
          3/4
        </Button>
      </Box>

      <Button
        variant="contained"
        onClick={() => window.dispatchEvent(new Event("applyEffect"))}
      >
        Apply
      </Button>
    </Box>
  );
}
