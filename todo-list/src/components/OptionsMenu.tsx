import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import { Divider } from "@mui/material";

export type SortOption = "dateAdded" | "lastUpdated";

interface OptionsMenuProps {
  showCompleted: boolean;
  showDeleted: boolean;
  onShowCompleted: () => void;
  onShowDeleted: () => void;
  sortBy: SortOption;
  setSortBy: (newValue: SortOption) => void;
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  showCompleted,
  showDeleted,
  onShowCompleted,
  onShowDeleted,
  sortBy,
  setSortBy,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
            setSortBy("dateAdded");
          }}
        >
          {sortBy === "dateAdded" && <>&#10003; </>}Show Newest First
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            setSortBy("lastUpdated");
          }}
        >
          {sortBy === "lastUpdated" && <>&#10003; </>}Last Updated First
        </MenuItem>

        <Divider />

        {/* FILTER */}
        <MenuItem
          onClick={() => {
            handleClose();
            onShowCompleted();
          }}
        >
          {showCompleted ? "Hide" : "Show"} Completed
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            onShowDeleted();
          }}
        >
          {showDeleted ? "Hide" : "Show"} Deleted
        </MenuItem>
      </Menu>
    </div>
  );
};

export default OptionsMenu;
