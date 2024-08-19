import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useRef, useState } from "react";
import { useData } from "../helpers/useData";
import CurrentImg from "./ImageEditor/CurrentImg";

export default function ImageHistory() {
  const { imgHistory, submitChange } = useData();
  const [isShowRestoreDialog, setIsShowRestoreDialog] = useState(-1);
  const containerRef = useRef<HTMLCanvasElement>(null);

  const restoreImage = (index: number) => {
    const toRestore = imgHistory[index];
    submitChange(toRestore.imageDataUrl, `restore ${toRestore.op}`);

    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollLeft = containerRef.current.scrollWidth;
      }
    }, 500);
  };

  return (
    <>
      {imgHistory.length > 0 && (
        <Box
          ref={containerRef}
          sx={{
            height: "120px",
            display: "flex",
            flexDirection: "row",
            gap: 2,
            overflowX: "auto",
            scrollbarWidth: "thin",
            scrollBehavior: "smooth",
          }}
        >
          {imgHistory.map((item, index) => (
            <Box>
              <figure
                key={`${index}-${item.op}`}
                style={{ cursor: "pointer" }}
                onClick={() => setIsShowRestoreDialog(index)}
                title={`Restore Image ${item.op}`}
              >
                <figcaption
                  style={{
                    textAlign: "center",
                    width: "100px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.op}
                </figcaption>
                <img
                  src={item.imageDataUrl}
                  style={{
                    height: "75px",
                    width: "100px",
                    objectFit: "contain",
                  }}
                />
              </figure>
            </Box>
          ))}
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          width: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <CurrentImg />
      </Box>

      <Dialog
        open={isShowRestoreDialog > -1}
        onClose={() => setIsShowRestoreDialog(-1)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Restore Image</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to RESTORE image?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsShowRestoreDialog(-1);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              restoreImage(isShowRestoreDialog);
              setIsShowRestoreDialog(-1);
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
