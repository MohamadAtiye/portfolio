import { IconButton, Paper, Popover } from "@mui/material";
import React, { ReactNode, useState } from "react";

interface DropDownPopperProps {
  children: ReactNode;
  ButtonIcon: ReactNode;
}
export default function DropDownPopper({
  children,
  ButtonIcon,
}: DropDownPopperProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <IconButton
        aria-controls="burger-menu"
        aria-haspopup="true"
        onClick={handleClick}
        color="inherit"
      >
        {ButtonIcon}
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Paper sx={{ zIndex: 9999, padding: 2, width: "300px" }}>
          {children}
        </Paper>
      </Popover>
    </div>
  );
}
