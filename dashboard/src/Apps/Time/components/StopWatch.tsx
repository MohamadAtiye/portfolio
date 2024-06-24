import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { msToTime } from "../../../helpers/utils";

enum WatchStatus {
  idle = "idle",
  started = "started",
  stopped = "stopped",
}

class StopWatchClass {
  static lastTime = 0;
  static elapsed = 0;
  static laps: number[] = [];
  static frameRender = 0;

  private static lapsCB = (laps: number[]) => {
    console.log(laps);
  };
  private static timerEl = null as HTMLSpanElement | null;
  static setEL(timerEl: HTMLSpanElement, lapsCB: (laps: number[]) => void) {
    StopWatchClass.timerEl = timerEl;
    StopWatchClass.lapsCB = lapsCB;
  }

  static drawTimerEl() {
    if (StopWatchClass.timerEl)
      StopWatchClass.timerEl.innerText = msToTime(StopWatchClass.elapsed);
  }
  static render() {
    const now = Date.now();
    StopWatchClass.elapsed += now - StopWatchClass.lastTime;
    StopWatchClass.lastTime = now;
    StopWatchClass.drawTimerEl();
    StopWatchClass.frameRender = requestAnimationFrame(StopWatchClass.render);
  }

  static start() {
    StopWatchClass.lastTime = Date.now();
    StopWatchClass.frameRender = requestAnimationFrame(StopWatchClass.render);
  }
  static stop() {
    cancelAnimationFrame(StopWatchClass.frameRender);
  }
  static lap() {
    StopWatchClass.laps.push(StopWatchClass.elapsed);
    StopWatchClass.elapsed = 0;
    StopWatchClass.lapsCB(StopWatchClass.laps);
  }
  static reset() {
    StopWatchClass.elapsed = 0;
    StopWatchClass.laps = [];
    StopWatchClass.drawTimerEl();
    StopWatchClass.lapsCB(StopWatchClass.laps);
  }
}

export default function StopWatch() {
  const [status, setStatus] = useState(WatchStatus.idle);
  const timerRef = useRef<HTMLSpanElement | null>(null);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    if (timerRef.current)
      StopWatchClass.setEL(timerRef.current, (newLaps: number[]) => {
        // setLaps([...newLaps]);
        setLaps([...newLaps].reverse());
      });

    return () => {
      StopWatchClass.stop();
      StopWatchClass.reset();
    };
  }, []);

  function handleBtnL() {
    if (status === WatchStatus.started) lap();
    else if (status === WatchStatus.stopped) reset();
  }
  function handleBtnR() {
    if (status === WatchStatus.idle) start();
    if (status === WatchStatus.started) stop();
    else if (status === WatchStatus.stopped) start();
  }

  function start() {
    StopWatchClass.start();
    setStatus(WatchStatus.started);
  }
  function stop() {
    StopWatchClass.stop();
    setStatus(WatchStatus.stopped);
  }
  function lap() {
    StopWatchClass.lap();
  }
  function reset() {
    StopWatchClass.reset();
    setStatus(WatchStatus.idle);
  }

  return (
    <Box
      sx={{
        width: "200px",
      }}
    >
      <Typography sx={{ textAlign: "center", fontSize: "1.5rem" }}>
        {status}
      </Typography>
      <Typography ref={timerRef} sx={{ fontSize: "2rem", textAlign: "center" }}>
        00:00:000
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Button L */}
        <Button
          onClick={handleBtnL}
          sx={{ flex: 1 }}
          variant="contained"
          disabled={status === WatchStatus.idle}
        >
          {status === WatchStatus.idle || status === WatchStatus.started
            ? "Lap"
            : "Reset"}
        </Button>
        {/* Button R */}
        <Button
          onClick={handleBtnR}
          sx={{ flex: 1 }}
          variant="contained"
          color={status === WatchStatus.started ? "error" : undefined}
        >
          {status === WatchStatus.idle
            ? "Start"
            : status === WatchStatus.started
            ? "Stop"
            : "Resume"}
        </Button>
      </Box>
      <Box>
        <List sx={{ overflowY: "auto", maxHeight: "200px" }}>
          {laps.map((v, i) => (
            <ListItem key={`lap${i}`} disablePadding>
              <ListItemText
                primary={`Lap ${laps.length - i}`}
                secondary={`${msToTime(v)}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}
