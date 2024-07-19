import { Box, Button, Grid, TextField } from "@mui/material";
import { useState } from "react";

export default function NormalCalculator() {
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<number | string>("");

  const handleClick = (value: string) => {
    setInput(input + value);
  };

  const handleClear = () => {
    setInput("");
    setResult("");
  };

  const handleCalculate = () => {
    try {
      // eslint-disable-next-line no-eval
      const evalResult = eval(input);
      setResult(evalResult);
    } catch {
      setResult("Error");
    }
  };

  return (
    <Box p={2} sx={{ width: "min(100% , 400px)", margin: "0 auto" }}>
      <TextField
        label="Input"
        variant="outlined"
        fullWidth
        value={input}
        disabled
        sx={{ mb: 2 }}
      />
      <TextField
        label="Result"
        variant="outlined"
        fullWidth
        value={result}
        disabled
        sx={{ mb: 2 }}
      />
      <Grid container spacing={1}>
        {[
          "7",
          "8",
          "9",
          "+",
          "4",
          "5",
          "6",
          "-",
          "1",
          "2",
          "3",
          "*",
          "+/-",
          "0",
          ".",
          "/",
        ].map((value) => (
          <Grid item xs={3} key={value}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleClick(value)}
            >
              {value}
            </Button>
          </Grid>
        ))}
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={handleClear}
          >
            Clear
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleCalculate}
          >
            =
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
