export type CheckIn = {
  id: string;
  name: string;
  spot: string;
  timestamp: Date;
};

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

function ago(ms: number) {
  return new Date(Date.now() - ms);
}

// Fake check-ins until the backend exists. Intentionally out of order so the
// sort in getSortedCheckIns is what puts the newest first.
const mockCheckIns: CheckIn[] = [
  { id: "1", name: "Alex", spot: "Grainger", timestamp: ago(10 * MINUTE) },
  { id: "2", name: "Jordan", spot: "Main Library", timestamp: ago(2 * HOUR) },
  { id: "3", name: "Priya", spot: "Illini Union", timestamp: ago(30 * 1000) },
  { id: "4", name: "Sam", spot: "Siebel Center", timestamp: ago(45 * MINUTE) },
  { id: "5", name: "Maya", spot: "Undergrad Library", timestamp: ago(26 * HOUR) },
  { id: "6", name: "Chris", spot: "Grainger", timestamp: ago(5 * HOUR) },
  { id: "7", name: "Taylor", spot: "ACES Library", timestamp: ago(3 * MINUTE) },
  { id: "8", name: "Devin", spot: "Main Library", timestamp: ago(3 * 24 * HOUR) },
  { id: "9", name: "Riley", spot: "Siebel Center", timestamp: ago(1 * HOUR) },
  { id: "10", name: "Jamie", spot: "Illini Union", timestamp: ago(20 * HOUR) },
];

export function getSortedCheckIns(): CheckIn[] {
  return [...mockCheckIns].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );
}
