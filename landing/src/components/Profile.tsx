import { Box, Typography } from "@mui/material";

export default function Profile() {
  return (
    <Box id="anchor-About-me" paddingTop="70px">
      <Typography variant="h4" align="center" gutterBottom>
        About me
      </Typography>
      <Typography fontSize={"1.5rem"}>MOHAMAD MEHDI ATIYE</Typography>
      <Typography variant="caption">28.10.1991 </Typography>
      <Typography>
        Organized, dedicated and ambitious professional with excellent attention
        to detail, and thirst for learning. Proven skills in software
        development, team leading, and working with tight timelines. With over 7
        years of professional experience, I am seeking the next opportunity to
        make a difference, grow personally and contribute to the people around
        me.
      </Typography>
    </Box>
  );
}
