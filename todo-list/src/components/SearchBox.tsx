import React from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import { Box } from "@mui/material";

interface SearchBoxProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <Box sx={{ flex: 1, borderRadius: "5px", overflow: "hidden" }}>
      <TextField
        fullWidth
        size="small"
        sx={{ minWidth: "180px", bgcolor: "white" }}
        placeholder="Search"
        value={searchQuery}
        onChange={handleSearchChange}
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
