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

const history = [
  {
    title: "Worked as Senior Artificial Intelligence and Full stack Engineer",
    subtitle: "at Predictive Healthcare",
    info: "Developed, trained, and integrated machine learning models for detection and prediction in the telemedicine field. Backend development using Node.js, TypeScript, and MySQL. Frontend development expertise with React and TypeScript.",
    from: "01.2022",
    to: "current",
  },
  {
    title: "Worked as Senior AI Engineer and WebRTC specialist",
    subtitle: "at Proximie",
    info: "Led projects related to object detection, motion analysis, and tracking using C++, Python, OpenCV, and TensorFlow. R&D in hand detection, tracking, and segmentation algorithms using WebGL and JavaScript. R&D in Natural Language Processing and voice control. WebRTC specialist responsible for frontend media management, stream handling, and live streaming. Customized WebRTC stats metrics and analytics using the ELK stack. Proficient in React and TypeScript for front-end development. Expertise in web sockets with socketIO servers.",
    from: "11.2017",
    to: "12.2022",
  },
  {
    title: "Studied a Master's degree, Informatics and Computer Engineering",
    subtitle: "at Peter the Great St. Petersburg Polytechnic University",
    info: "Focused on AI, ML, and image processing fundamentals. Completed courses in advanced mathematics, optimization, programming languages, and robotics. Thesis on path optimization for overhead bird’s eye drones using image processing.",
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
    info: "Graduated with A-grades in programming courses. Emphasis on web and desktop app development, databases, networking, and IT infrastructure.",
    from: "10.2009",
    to: "07.2014",
  },
];

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
    <Box my={3}>
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
            <Paper
              key={h.title}
              sx={{ marginBottom: "50px", position: "relative", padding: 2 }}
            >
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
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
