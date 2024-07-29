import {
  Box,
  BoxProps,
  Paper,
  SxProps,
  Theme,
  Typography,
  keyframes,
  styled,
} from "@mui/material";
import { ReactNode, useEffect, useRef, useState } from "react";

const history = [
  {
    title: "Worked as Senior Artificial Intelligence and Full stack Engineer",
    subtitle: "at Predictive Healthcare",
    info: `ML: Python, TensorFlow, openCV, Keras, MediaPipe, object detection, recognition, and classification, image processing.
    Frontend: React, Typescript. 
    Backend: NodeJs, TypeScript, MySql, AWS, Prisma.`,
    from: "01.2022",
    to: "current",
  },
  {
    title: "Worked as Senior AI Engineer and WebRTC specialist",
    subtitle: "at Proximie",
    info: `ML: TensorFlow, openCV, object detection and tracking, image processing, natural language processing. 
    Frontend: React, Typescript, WebGL, Canvas 2d graphics, 3d graphics, WebRTC.
    Backend: NodeJs, webSockets.
    `,
    from: "11.2017",
    to: "12.2022",
  },
  {
    title: "Studied a Master's degree, Informatics and Computer Engineering",
    subtitle: "at Peter the Great St. Petersburg Polytechnic University",
    info: "Focused on AI, ML, and image processing fundamentals. Thesis on path optimization for overhead bird’s eye drones using image processing.",
    from: "09.2015",
    to: "07.2017",
  },
  {
    title: "Studied a Pre-University Preparatory Course of Russian Language",
    subtitle:
      "at Saint Petersburg State University of Architecture and Civil Engineering ",
    info: "Studied Russian language fundamentals and history.",
    from: "09.2014",
    to: "07.2015",
  },
  {
    title: "Studied a Bachelor's degree, Information Technology ",
    subtitle: "at Lebanese International University",
    info: "Emphasis on web and desktop app development, databases, networking, and IT infrastructure.",
    from: "10.2009",
    to: "07.2014",
  },
];

interface ScrollToShowDivProps {
  children: ReactNode;
}
const ScrollToShowDiv = ({ children }: ScrollToShowDivProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const divRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Stop observing after the element is visible
        }
      },
      {
        threshold: 0.7, // Adjust as needed; 0.1 means 10% of the element is visible
      }
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    // Clean up the observer on component unmount
    return () => {
      if (divRef.current) {
        observer.unobserve(divRef.current);
      }
    };
  }, []);

  return (
    <Paper
      ref={divRef}
      sx={{
        marginBottom: "50px",
        position: "relative",
        padding: 2,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "" : "scale(0.9)translate(-50px,100px)",
        transition: "all ease-in 0.3s",
      }}
    >
      {children}
    </Paper>
  );
};

const appearDisappear = keyframes`
  0% {
    opacity: 1;
  }
  25% {
    opacity: 0.66;
  }
  50% {
    opacity: 0.33;
  }
  75% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
`;

const RedCircle = () => {
  return (
    <svg width="20" height="20">
      <circle cx="10" cy="10" r="10" fill="red" />
    </svg>
  );
};

interface AnimatedBoxProps extends BoxProps {
  delay?: number;
  sx?: SxProps<Theme>;
  count: number;
}
const AnimatedBox = styled(Box)<AnimatedBoxProps>(({ delay, sx, count }) => ({
  fontSize: "24px",
  opacity: 0,
  animation: `${appearDisappear} ${count / 2}s infinite`,
  animationDelay: `${delay || 0}s`,
  sx: sx,
}));

export default function Journey() {
  return (
    <Box paddingTop="70px" id="anchor-My-Journey">
      <Typography variant="h4" align="center" gutterBottom>
        My Journey
      </Typography>
      <Box sx={{ position: "relative" }}>
        {/* vertical red line */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "50px",
            height: "100%",
            width: "1px",
            border: "2px solid red",
          }}
        ></Box>
        {/* sections */}
        <Box sx={{ paddingLeft: "70px" }}>
          {history.map((h, i) => (
            <ScrollToShowDiv key={h.title}>
              <Typography fontSize={"1.1rem"}>{h.title}</Typography>
              <Typography variant="caption">{h.subtitle}</Typography>
              <Typography fontSize={"0.8rem"}>{h.info}</Typography>

              {/* absolute elements */}
              <AnimatedBox
                sx={{ position: "absolute", top: 0, left: "-28px" }}
                delay={(history.length - i + 0.5) / 4}
                count={history.length}
              >
                <RedCircle />
              </AnimatedBox>
              <Typography
                variant="caption"
                sx={{ position: "absolute", top: 0, left: "-80px" }}
              >
                {h.to}
              </Typography>
              <AnimatedBox
                sx={{ position: "absolute", bottom: 0, left: "-28px" }}
                delay={(history.length - i) / 4}
                count={history.length}
              >
                <RedCircle />
              </AnimatedBox>
              <Typography
                variant="caption"
                sx={{ position: "absolute", bottom: 0, left: "-80px" }}
              >
                {h.from}
              </Typography>
            </ScrollToShowDiv>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
