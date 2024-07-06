import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import { Divider } from "@mui/material";
import { useNotes } from "../hooks/useNotes";
import { SortOption } from "../helpers/types";

const OptionsMenu = () => {
  const { displaySettings, setDisplaySettings } = useNotes();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleShowDeleted = () => {
    setDisplaySettings((p) => ({ ...p, showDeleted: !p.showDeleted }));
  };
  const toggleShowCompleted = () => {
    setDisplaySettings((p) => ({ ...p, showCompleted: !p.showCompleted }));
  };
  const changeSortBy = (val: SortOption) => {
    setDisplaySettings((p) => ({ ...p, sortBy: val }));
  };

  return (
    <div>
      <IconButton
        aria-controls="burger-menu"
        aria-haspopup="true"
        onClick={handleMenuClick}
        color="inherit"
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="burger-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {/* SORT */}
        <MenuItem
          onClick={() => {
            handleClose();
            changeSortBy("dateAdded");
          }}
        >
          {displaySettings.sortBy === "dateAdded" && <>&#10003; </>}Show Newest
          First
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            changeSortBy("lastUpdated");
          }}
        >
          {displaySettings.sortBy === "lastUpdated" && <>&#10003; </>}Last
          Updated First
        </MenuItem>

        <Divider />

        {/* FILTER */}
        <MenuItem
          onClick={() => {
            handleClose();
            toggleShowCompleted();
          }}
        >
          {displaySettings.showCompleted ? "Hide" : "Show"} Completed
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            toggleShowDeleted();
          }}
        >
          {displaySettings.showDeleted ? "Hide" : "Show"} Deleted
        </MenuItem>
      </Menu>
    </div>
  );
};

export default OptionsMenu;
