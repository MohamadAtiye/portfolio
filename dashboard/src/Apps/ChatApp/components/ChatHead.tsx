import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useData } from "../helpers/useData";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useState } from "react";

export default function ChatHead() {
  const { name, deleteSession } = useData();
  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false);

  const onConfirmDelete = () => {
    deleteSession();
    setIsShowDeleteDialog(false);
  };

  return (
    <>
      <Box>
        <Typography align="center">
          {name ? `Welcome ${name}` : "waiting for session"}
          <Tooltip title="Delete Session">
            <IconButton
              sx={{ marginLeft: 2 }}
              onClick={() => setIsShowDeleteDialog(true)}
            >
              <LogoutOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Typography>
      </Box>
      <Dialog
        open={isShowDeleteDialog}
        onClose={() => setIsShowDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Delete Session
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete your session? Your ID, Name, and all
            open chats will be lost
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsShowDeleteDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={onConfirmDelete} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
