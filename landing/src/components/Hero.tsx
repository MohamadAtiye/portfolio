import { Box, Container, Paper, Typography } from "@mui/material";

import { TypographyProps } from "@mui/material";
import { styled } from "@mui/system";
import { keyframes } from "@emotion/react";

const appearDisappear = keyframes`
  0% {
    opacity: 0;
  }
  25% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  70% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
`;

interface AnimatedTypographyProps extends TypographyProps {
  delay?: string;
  duration?: string;
}
const AnimatedTypography = styled(Typography)<AnimatedTypographyProps>(
  ({ delay, duration }) => ({
    fontSize: "24px",
    opacity: 0,
    animation: `${appearDisappear} ${duration || "2s"} infinite`,
    animationDelay: delay || "0s",
  })
);

function rand(
  l: number,
  h: number,
  unit?: undefined | string,
  isFloat = false
) {
  let n = Math.random() * (h - l) + l;
  if (!isFloat) n = Math.round(n * 10) / 10;

  if (!unit) return n;
  return `${n}${unit}`;
}

function calcDuration() {
  return rand(2, 4, "s", true);
}
function calcDelay() {
  return rand(0, 5, "s", true);
}

const disapearingText = [
  {
    text: "Typescript",
    delay: calcDelay(),
    duration: calcDuration(),
    mr: rand(10, 50),
  },
  {
    text: "React",
    delay: calcDelay(),
    duration: calcDuration(),
    mr: rand(10, 50),
  },
  {
    text: "WebRTC",
    delay: calcDelay(),
    duration: calcDuration(),
    mr: rand(10, 50),
  },
  {
    text: "WebGL",
    delay: calcDelay(),
    duration: calcDuration(),
    mr: rand(10, 50),
  },
  {
    text: "Nodejs",
    delay: calcDelay(),
    duration: calcDuration(),
    mr: rand(10, 50),
  },
  {
    text: "WebSockets",
    delay: calcDelay(),
    duration: calcDuration(),
    mr: rand(10, 50),
  },
  {
    text: "MySql",
    delay: calcDelay(),
    duration: calcDuration(),
    mr: rand(10, 50),
  },
  {
    text: "Reddis",
    delay: calcDelay(),
    duration: calcDuration(),
    mr: rand(10, 50),
  },
  {
    text: "Python",
    delay: calcDelay(),
    duration: calcDuration(),
    mr: rand(10, 50),
  },
  {
    text: "ML & AI",
    delay: calcDelay(),
    duration: calcDuration(),
    mr: rand(10, 50),
  },
];

export default function Hero() {
  console.log(disapearingText);
  return (
    <Paper
      sx={{
        margin: 0,
        padding: 0,
        height: { xs: "250px", md: "600px" },
        background: "linear-gradient(to right,white, white, black,black)",
      }}
      elevation={3}
    >
      <Container sx={{ height: "100%", position: "relative" }}>
        <img
          src="./Hero.jpg"
          style={{ height: "100%", width: "100%", objectFit: "contain" }}
        />

        {/* TEXT CONTAINER */}
        <Box
          sx={{
            position: "absolute",
            right: { xs: "16px", md: "100px" },
            top: { xs: "16px", md: "100px" },
            color: "white",
            textAlign: "right",
          }}
        >
          {disapearingText.map((t) => (
            <AnimatedTypography
              key={t.text}
              sx={{
                marginRight: { xs: `${t.mr}px`, md: `${Number(t.mr) * 4}px` },
                lineHeight: { xs: 0.8, md: 1.5 },
              }}
              delay={`${t.delay}`}
              duration={`${t.duration}`}
            >
              {t.text}
            </AnimatedTypography>
          ))}
        </Box>
      </Container>
    </Paper>
  );
}
