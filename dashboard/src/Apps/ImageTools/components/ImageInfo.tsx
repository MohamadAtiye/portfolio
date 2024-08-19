import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useData } from "../helpers/useData";
import { formatFileSize } from "../helpers/utils";

export default function ImageInfo() {
  const { srcImgInfo, clearSrc, currentImage } = useData();

  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false);

  if (!currentImage) return <></>;
  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          paddingBottom: 1,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography>Source Image:</Typography>
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              setIsShowDeleteDialog(true);
            }}
          >
            Remove
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography>Name</Typography>
          <Typography>{srcImgInfo.name}</Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography>Size</Typography>
          <Typography>{formatFileSize(srcImgInfo.size)}</Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography>Type</Typography>
          <Typography>{srcImgInfo.type}</Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography>Dims</Typography>
          <Typography>
            w:{srcImgInfo.w}, h:{srcImgInfo.h}
          </Typography>
        </Box>
      </Box>

      <Dialog
        open={isShowDeleteDialog}
        onClose={() => setIsShowDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Remove Image</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove image? You will lose any changes
            made.
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
          <Button
            onClick={() => {
              clearSrc();
              setIsShowDeleteDialog(false);
            }}
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
