import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Backdrop,
  Box,
} from "@mui/material";
import styled from "@emotion/styled";

const StyledBackdrop = styled(Backdrop)`
  z-index: 1;
  color: "#fff";
`;

interface NameDialogProps {
  onSubmit: (name: string) => Promise<void>;
}
export default function NameDialog({ onSubmit }: NameDialogProps) {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(name);
  };

  return (
    <StyledBackdrop open={true}>
      <Dialog open={true}>
        <Box component={"form"} onSubmit={handleSubmit}>
          <DialogTitle>Enter your name</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Your Name"
              type="text"
              fullWidth
              variant="standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button type="submit" color="primary">
              Submit
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </StyledBackdrop>
  );
}
