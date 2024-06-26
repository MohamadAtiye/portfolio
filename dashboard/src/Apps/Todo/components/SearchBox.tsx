import React from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import { Box } from "@mui/material";
import { useNotes } from "../hooks/useNotes";

const SearchBox = () => {
  const { searchQuery, setSearchQuery } = useNotes();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <Box sx={{ flex: 1, borderRadius: "5px" }}>
      <TextField
        fullWidth
        size="small"
        sx={{ minWidth: "180px" }}
        placeholder="Search"
        value={searchQuery}
        onChange={handleSearchChange}
        autoComplete="off"
        InputProps={{
          endAdornment: searchQuery.length ? (
            <IconButton onClick={handleClearSearch} edge="end">
              <ClearIcon />
            </IconButton>
          ) : null,
        }}
      />
    </Box>
  );
};

export default SearchBox;
