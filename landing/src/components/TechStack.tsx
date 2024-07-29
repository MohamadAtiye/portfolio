import React, { useEffect, useState } from "react";
import { Box, BoxProps, keyframes, styled, Typography } from "@mui/material";
import { URL_DASHBOARD } from "../assets/strings";

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
  { name: "WebRTC", src: "/images/webrtc.png" },
];

const rotater = keyframes`
0% {
    transform: scale(1.2) translateX(0px) translateY(0px);
    z-index:4;
}
25% {
    transform: scale(1) translateX(calc(-50vw + 70px)) translateY(-40px);
    z-index:3;
}
26% {
    // transform: scale(1) calc(-50vw + 100px) translateY(-40px);
    z-index:2;
}
50% {
    transform: scale(0.8) translateX(0) translateY(-80px);
    z-index:1;
}
74% {
    // transform: scale(0.8) translateX(calc(50vw - 70px)) translateY(-80px);
    z-index:2;
}
75% {
    transform: scale(1) translateX(calc(50vw - 70px)) translateY(-40px);
    z-index:3;
}
100% {
    transform: scale(1.2) translateX(0px) translateY(0px);
    z-index:4;
}
`;

interface TechStackItemProps extends BoxProps {
  delay?: number;
  count?: number;
}
const TechStackItem = styled(Box)<TechStackItemProps>(
  ({ delay = 0, count = 1 }) => ({
    zIndex: 3,
    fontSize: "24px",
    //   opacity: 0,
    left: "calc(50% - 60px)",
    top: "80px",
    animation: `${rotater} ${count}s linear  infinite`,
    animationDelay: `${delay || 0}s`,
    position: "absolute",
  })
);

const TechStack: React.FC = () => {
  const [scale, setScale] = useState(1); // Initial scale value, adjust as needed

  useEffect(() => {
    const updateScale = () => {
      const bodySize = document.body.clientWidth;
      const minBodySize = 400;
      const maxBodySize = 1000;

      let newScale =
        0.5 + ((bodySize - minBodySize) / (maxBodySize - minBodySize)) * 0.5;
      newScale = Math.max(0.4, Math.min(1, newScale)); // Ensure scale stays within 0.5 to 1

      setScale(newScale);
    };
    window.addEventListener("resize", updateScale);
    updateScale();
    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <Box id="anchor-tech-stack" paddingTop="70px">
      <Typography variant="h4" align="center" gutterBottom>
        Tech Stack
      </Typography>
      <Typography align="center" gutterBottom>
        Check my projects{" "}
        <a href={URL_DASHBOARD} target="_blank">
          here
        </a>
      </Typography>
      <Box sx={{ position: "relative", height: "250px" }}>
        {techStack.map((tech, i) => (
          <TechStackItem key={tech.name} delay={i} count={techStack.length}>
            <Box
              sx={{
                transform: `scale(${scale})`,
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                boxShadow: 3,
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "scale(1.3)",
                },
                display: "flex",
                flexDirection: "column",
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
                style={{ height: "70px", width: "70px", objectFit: "contain" }}
              />
              <Typography variant="subtitle1">{tech.name}</Typography>
            </Box>
          </TechStackItem>
        ))}
      </Box>
    </Box>
  );
};

export default TechStack;
