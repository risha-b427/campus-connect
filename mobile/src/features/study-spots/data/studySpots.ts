export type StudySpot = {
  id: string;
  name: string;
  building: string;
  isFree: boolean;
  hours: string;
  latitude: number;
  longitude: number;
};

// Sample data for development.
// Hours, costs, and coordinates are not verified.
export const studySpots: StudySpot[] = [
  {
    id: "spot-1",
    name: "Quiet Reading Room",
    building: "Main Library",
    isFree: true,
    hours: "8 AM – 10 PM",
    latitude: 40.104,
    longitude: -88.229,
  },
  {
    id: "spot-2",
    name: "Engineering Study Tables",
    building: "Grainger Library",
    isFree: true,
    hours: "8 AM – 11 PM",
    latitude: 40.113,
    longitude: -88.227,
  },
  {
    id: "spot-3",
    name: "Student Lounge",
    building: "Illini Union",
    isFree: true,
    hours: "7 AM – 11 PM",
    latitude: 40.109,
    longitude: -88.227,
  },
  {
    id: "spot-4",
    name: "Group Study Area",
    building: "Siebel Center",
    isFree: true,
    hours: "9 AM – 9 PM",
    latitude: 40.114,
    longitude: -88.225,
  },
  {
    id: "spot-5",
    name: "Coffee Shop Tables",
    building: "Sample Campus Café",
    isFree: false,
    hours: "7 AM – 6 PM",
    latitude: 40.110,
    longitude: -88.230,
  },
  {
    id: "spot-6",
    name: "Reserved Study Room",
    building: "Sample Coworking Center",
    isFree: false,
    hours: "9 AM – 8 PM",
    latitude: 40.112,
    longitude: -88.231,
  },
];