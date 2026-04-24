import { useEffect, useMemo, useState } from "react";

const formatTime = (ms) => {
  if (ms <= 0) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export const useContestTimer = (startTime, endTime) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!startTime || !endTime) {
      return {
        state: "upcoming",
        label: "Countdown",
        timeText: "00:00:00",
        canStart: false,
        isLocked: true,
      };
    }

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (now < start) {
      return {
        state: "countdown",
        label: "Starts in",
        timeText: formatTime(start - now),
        canStart: false,
        isLocked: true,
      };
    }

    if (now <= end) {
      return {
        state: "live",
        label: "Time left",
        timeText: formatTime(end - now),
        canStart: true,
        isLocked: false,
      };
    }

    return {
      state: "ended",
      label: "Contest ended",
      timeText: "00:00:00",
      canStart: false,
      isLocked: true,
    };
  }, [endTime, now, startTime]);
};
