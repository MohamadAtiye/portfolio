import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Clock from "react-clock";
import "react-clock/dist/Clock.css"; // Import default styling
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getWeekNumber(date: Date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - onejan.getTime();
  return Math.ceil((diff / 86400000 + onejan.getDay() + 1) / 7);
}

function getTimePassedThisYear() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1); // January 1st of the current year

  const timeDifference = now.getTime() - startOfYear.getTime();
  const secondsPassed = Math.floor(timeDifference / 1000);
  const minutesPassed = Math.floor(secondsPassed / 60);
  const hoursPassed = Math.floor(minutesPassed / 60);
  const daysPassed = Math.floor(hoursPassed / 24);

  return {
    days: daysPassed,
    hours: hoursPassed % 24,
    minutes: minutesPassed % 60,
    seconds: secondsPassed % 60,
  };
}
function getTimeRemainingToEndOfYear() {
  const now = new Date();
  const endOfYear = new Date(now.getFullYear(), 11, 31); // December 31st of the current year

  const timeDifference = endOfYear.getTime() - now.getTime();
  const secondsRemaining = Math.floor(timeDifference / 1000);
  const minutesRemaining = Math.floor(secondsRemaining / 60);
  const hoursRemaining = Math.floor(minutesRemaining / 60);
  const daysRemaining = Math.floor(hoursRemaining / 24);

  return {
    days: daysRemaining,
    hours: hoursRemaining % 24,
    minutes: minutesRemaining % 60,
    seconds: secondsRemaining % 60,
  };
}

export default function TimeNow() {
  const [timeNow, setTimeNow] = useState(new Date());

  useEffect(() => {
    let isStop = false;

    function updateTime() {
      if (isStop) return;

      setTimeNow(new Date());

      requestAnimationFrame(updateTime);
    }
    requestAnimationFrame(updateTime);

    return () => {
      isStop = true;
    };
  }, []);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        // gap: 1,
        overflowY: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Clock value={timeNow} />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar sx={{ margin: 0 }} />
        </LocalizationProvider>
      </Box>

      <br />

      <Typography>Date String: {timeNow.toString()}</Typography>
      <br />
      <Typography>Day: {daysOfWeek[timeNow.getDay()]}</Typography>
      <Typography>Date: {timeNow.getDate()}</Typography>
      <Typography>
        Month: {timeNow.getMonth() + 1}, {monthNames[timeNow.getMonth()]}
      </Typography>
      <Typography>Year: {timeNow.getFullYear()}</Typography>
      <Typography>Week: {getWeekNumber(timeNow)}</Typography>
      <br />
      <Typography>
        Time passed this year: {JSON.stringify(getTimePassedThisYear())}
      </Typography>
      <Typography>
        Time till end of year: {JSON.stringify(getTimeRemainingToEndOfYear())}
      </Typography>
      <br />
      <Typography>Locale String: {timeNow.toLocaleString()}</Typography>
      <Typography>ISO String: {timeNow.toISOString()}</Typography>
      <Typography>UTC String: {timeNow.toUTCString()}</Typography>
      <Typography>Unix TS: {timeNow.getTime()}</Typography>
      <Typography>
        UTC diff: {timeNow.getTimezoneOffset()} minutes or{" "}
        {timeNow.getTimezoneOffset() / 60} hours
      </Typography>
    </Box>
  );
}
