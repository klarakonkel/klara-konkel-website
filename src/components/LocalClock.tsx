import { useEffect, useState } from "react";

// Klara's current base — update the label + timezone as she relocates.
const CITY = "berlin";
const TIME_ZONE = "Europe/Berlin";

const format = () =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TIME_ZONE,
  })
    .format(new Date())
    .toLowerCase();

const LocalClock = () => {
  const [time, setTime] = useState(format);

  useEffect(() => {
    const id = setInterval(() => setTime(format()), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="text-sm text-muted-foreground">
      {CITY} · {time}
    </p>
  );
};

export default LocalClock;
