export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type StudySpot = {
  id: string;
  name: string;
  location: Coordinates;
  // How full the spot is right now, from 0 (empty) to 1 (completely full).
  occupancy: number;
};

// Pretend the user is standing on the Main Quad until we use real GPS.
export const FAKE_USER_LOCATION: Coordinates = {
  latitude: 40.1075,
  longitude: -88.2272,
};

// Fake spots until the backend exists. Names match the fake check-ins.
export const mockStudySpots: StudySpot[] = [
  {
    id: "grainger",
    name: "Grainger",
    location: { latitude: 40.1125, longitude: -88.2269 },
    occupancy: 0.95,
  },
  {
    id: "main-library",
    name: "Main Library",
    location: { latitude: 40.1048, longitude: -88.229 },
    occupancy: 0.2,
  },
  {
    id: "undergrad-library",
    name: "Undergrad Library",
    location: { latitude: 40.1047, longitude: -88.2273 },
    occupancy: 0.7,
  },
  {
    id: "siebel-center",
    name: "Siebel Center",
    location: { latitude: 40.1138, longitude: -88.2249 },
    occupancy: 0.45,
  },
  {
    id: "illini-union",
    name: "Illini Union",
    location: { latitude: 40.1093, longitude: -88.2272 },
    occupancy: 0.88,
  },
  {
    id: "aces-library",
    name: "ACES Library",
    location: { latitude: 40.1027, longitude: -88.2252 },
    occupancy: 0.35,
  },
];
