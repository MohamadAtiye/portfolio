import React from "react";
import { Box, Grid, Typography } from "@mui/material";

const techStack = [
  { name: "Python", src: "/images/python.png" },
  { name: "HTML5", src: "/images/html5.png" },
  { name: "CSS3", src: "/images/css3.png" },
  { name: "JavaScript", src: "/images/javascript.png" },
  { name: "TypeScript", src: "/images/typescript.png" },
  { name: "SQL", src: "/images/sql.png" },
  { name: "React", src: "/images/react.png" },
  { name: "NodeJs", src: "/images/nodejs.png" },
  { name: "Docker", src: "/images/docker.png" },
  { name: "Git", src: "/images/git.png" },
];

const TechStack: React.FC = () => {
  return (
    <Box sx={{ textAlign: "center", my: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Tech Stack
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {techStack.map((tech) => (
          <Grid item key={tech.name} xs={6} sm={4} md={3} lg={2}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  boxShadow: 3,
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                  background:
                    "linear-gradient(90deg, rgba(139,155,154,1) 11%, rgba(92,170,169,1) 43%, rgba(91,95,95,1) 100%)",
                }}
              >
                <img
                  src={tech.src}
                  alt={tech.name}
                  style={{ height: "70%", width: "70%", objectFit: "contain" }}
                />
              </Box>
              <Typography variant="subtitle1">{tech.name}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TechStack;
