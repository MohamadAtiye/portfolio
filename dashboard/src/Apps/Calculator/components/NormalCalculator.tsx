import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

function countSpecificCharacter(str: string, charToCount: string) {
  let count = 0;
  for (const char of str) {
    if (char === charToCount) {
      count++;
    }
  }

  return count;
}

function isNumber(val: string) {
  return !isNaN(Number(val) + 1);
}

function getLastFullNumber(val: string): number {
  // Use a regular expression to match all numbers in the string
  const matches = val.match(/-?\d+(\.\d+)?/g);

  // Check if there are any matches and return the last one as a number
  if (matches && matches.length > 0) {
    return parseFloat(matches[matches.length - 1]);
  }

  // If no matches found, return NaN or throw an error
  return NaN;
}

const handleInput = (old: string, value: string): string => {
  const oc = countSpecificCharacter(old, "(");
  const cc = countSpecificCharacter(old, ")");
  const lastChar = old.charAt(old.length - 1);

  console.log({ oc, cc, lastChar });

  // handle parenthesis cases
  if (value === "()") {
    //handle opening normal
    if (["=", "-", "*", "/", "("].indexOf(lastChar) > -1 || old.length === 0) {
      return old + "(";
    }

    // handle opening with multiplication after number or closing
    if (oc === cc && (isNumber(lastChar) || lastChar === ")")) {
      return old + "*(";
    }

    // handle after dot
    if (lastChar === ".") {
      return old + "0" + (oc > cc ? ")" : "*(");
    }

    // handle closing
    if (oc > cc) return old + (lastChar === "." ? "0" : "") + ")";
  }

  if (value === ".") {
    // handle empty
    if (old.length === 0) return "0.";

    // handle after operation of opening
    if (["=", "-", "*", "/", "("].indexOf(lastChar) > -1) {
      return old + "0.";
    }

    // handle after closing
    if (lastChar === ")") return old + "*0.";

    // handle no multi dot per number
    // point after number
    if (isNumber(lastChar) && getLastFullNumber(old) % 1 === 0) {
      return old + ".";
    }
  }

  // handle operations "+", "-", "*", "/"
  if (["+", "-", "*", "/"].indexOf(value) > -1) {
    if (isNumber(lastChar) || lastChar === ")") return old + value;
    if (lastChar === ".") return old + "0" + value;
  }

  // handle numbers
  if (isNumber(value)) {
    // add multiplication if after closing
    if (lastChar === ")") return old + "*" + value;

    return old + value;
  }

  if (value === "+/-") {
    if (isNumber(lastChar)) {
      const lastNum = getLastFullNumber(old);
      const lastNumStr = lastNum.toString();
      const newNumStr =
        lastNum > 0 ? `(-${lastNumStr}` : lastNumStr.slice(2, -1);

      return old.slice(0, old.lastIndexOf(lastNumStr)) + newNumStr;
    }
  }

  // TODO handle percent %

  return old;
};

export default function NormalCalculator() {
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<number | string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [history, setHistory] = useState<[string, string, number][]>([]);

  const handleClick = (value: string) => {
    // handle clear
    if (value === "C") return handleClear();

    // handle equal
    if (value === "=") {
      return handleCalculate(input, true);
    }

    const newInput = handleInput(input, value);
    setInput(newInput);
    handleCalculate(newInput);
  };

  const handleClear = () => {
    setInput("");
    setResult("");
  };

  const handleCalculate = (value: string, isForced = false) => {
    try {
      // eslint-disable-next-line no-eval
      const evalResult = eval(value.length ? value : "0");
      setResult(evalResult);

      if (isForced) {
        setHistory((p) => [[uuidv4(), value, evalResult], ...p]);
      }
    } catch {
      setResult("Error");
    }
  };

  const handleErase = () => {
    const newInput = input.substring(0, input.length - 1);
    handleCalculate(newInput);
    setInput(newInput);
  };

  return (
    <Box
      p={2}
      sx={{
        width: "min(100% , 400px)",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
        overflow: "hidden",
      }}
    >
      <TextField
        label="Input"
        variant="outlined"
        fullWidth
        value={input}
        onChange={() => {
          //do nothing
        }}
        disabled
        sx={{ mb: 2 }}
        ref={inputRef}
      />
      <TextField
        label="Result"
        variant="outlined"
        fullWidth
        value={result}
        disabled
        sx={{ mb: 2 }}
      />

      <Box
        sx={{
          marginBottom: 1,
          paddingBottom: 1,
          borderBottom: "1px solid black",
        }}
      >
        <Button variant="contained" onClick={handleErase}>
          erase
        </Button>
      </Box>
      <Grid container spacing={1}>
        {[
          "C",
          "()",
          "%",
          "/",
          "7",
          "8",
          "9",
          "*",
          "4",
          "5",
          "6",
          "-",
          "1",
          "2",
          "3",
          "+",
          "+/-",
          "0",
          ".",
          "=",
        ].map((value) => (
          <Grid item xs={3} key={value}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                handleClick(value);
              }}
              color={
                value === "C"
                  ? "error"
                  : value === "="
                  ? "success"
                  : ["()", "%", "/", "*", "-", "+"].indexOf(value) > -1
                  ? "secondary"
                  : "primary"
              }
            >
              {value}
            </Button>
          </Grid>
        ))}
      </Grid>

      <Typography mt={3}>History</Typography>
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List component="nav" disablePadding dense>
          {history.map((h) => (
            <ListItem key={h[0]}>
              <ListItemButton onClick={() => setInput(h[1])} dense>
                <ListItemText primary={h[1]} secondary={`=${h[2]}`} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}
