export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type StudySpot = {
  id: string;
  name: string;      // building name, e.g. "Main Library"
  area?: string;     // specific spot inside, e.g. "Quiet Reading Room"
  location: Coordinates;
  // How full the spot is right now, from 0 (empty) to 1 (completely full).
  occupancy: number;
  isFree: boolean;
  hours: string;
};

// Pretend the user is standing on the Main Quad until we use real GPS.
export const FAKE_USER_LOCATION: Coordinates = {
  latitude: 40.1075,
  longitude: -88.2272,
};

// Fake spots until the backend exists. IDs match mockCheckIns.
// Hours and coordinates are not verified.
export const mockStudySpots: StudySpot[] = [
  {
    id: "main-library",
    name: "Main Library",
    area: "Quiet Reading Room",
    location: { latitude: 40.1048, longitude: -88.229 },
    occupancy: 0.2,
    isFree: true,
    hours: "8 AM – 10 PM",
  },
  {
    id: "grainger",
    name: "Grainger",
    area: "Engineering Study Tables",
    location: { latitude: 40.1125, longitude: -88.2269 },
    occupancy: 0.95,
    isFree: true,
    hours: "8 AM – 11 PM",
  },
  {
    id: "illini-union",
    name: "Illini Union",
    area: "Student Lounge",
    location: { latitude: 40.1093, longitude: -88.2272 },
    occupancy: 0.88,
    isFree: true,
    hours: "7 AM – 11 PM",
  },
  {
    id: "siebel-center",
    name: "Siebel Center",
    area: "Group Study Area",
    location: { latitude: 40.1138, longitude: -88.2249 },
    occupancy: 0.45,
    isFree: true,
    hours: "9 AM – 9 PM",
  },
  {
    id: "campus-cafe",
    name: "Sample Campus Café",
    area: "Coffee Shop Tables",
    location: { latitude: 40.11, longitude: -88.23 },
    occupancy: 0.6,
    isFree: false,
    hours: "7 AM – 6 PM",
  },
  {
    id: "coworking-center",
    name: "Sample Coworking Center",
    area: "Reserved Study Room",
    location: { latitude: 40.112, longitude: -88.231 },
    occupancy: 0.3,
    isFree: false,
    hours: "9 AM – 8 PM",
  },
  {
    id: "spot-7",
    name: "Undergrad Library",
    location: { latitude: 40.1047, longitude: -88.2273 },
    occupancy: 0.7,
    isFree: true,
    hours: "24 hours",
  },
  {
    id: "spot-8",
    name: "ACES Library",
    location: { latitude: 40.1027, longitude: -88.2252 },
    occupancy: 0.35,
    isFree: true,
    hours: "8 AM – 10 PM",
  },
];