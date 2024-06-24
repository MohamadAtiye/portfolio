export function msToTime(duration: number) {
  const milliseconds = Math.floor(duration % 1000),
    seconds = Math.floor((duration / 1000) % 60),
    minutes =
      Math.floor((duration / (1000 * 60)) % 60) +
      Math.floor((duration / (1000 * 60 * 60)) * 60); // Convert hours to minutes and add to minutes

  const s_minutes = minutes < 10 ? "0" + minutes : minutes;
  const s_seconds = seconds < 10 ? "0" + seconds : seconds;
  const s_milliseconds =
    milliseconds < 10
      ? "00" + milliseconds
      : milliseconds < 100
      ? "0" + milliseconds
      : milliseconds;

  return s_minutes + ":" + s_seconds + ":" + s_milliseconds;
}
