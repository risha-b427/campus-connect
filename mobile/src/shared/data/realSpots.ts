import type { Spot } from "../types";

// Real study spots on and around the UIUC campus.
//
// Hours are for Fall 2026 and change on breaks and between semesters:
// - Buildings: campus Fall 2026 building schedule, updated 10/14/26.
// - Libraries: University Library hours, checked 11/6/26.
// - Cafe Bene, ISR: Google Maps, checked 11/6/26.
//
// isFree means you can study there without paying for anything.
export const realSpots: Spot[] = [
  {
    id: "grainger",
    name: "Grainger",
    building: "Grainger Engineering Library Information Center",
    isFree: true,
    hours: "Mon–Fri 24 hours; Sat–Sun 10 AM – 12 AM",
    latitude: 40.11268839102512,
    longitude: -88.22692793244944,
  },
  {
    id: "cif",
    name: "CIF",
    building: "Campus Instructional Facility",
    isFree: true,
    hours: "Mon–Thu 7 AM – 11 PM; Fri 7 AM – 9 PM; Sat 9 AM – 9 PM; Sun 12 PM – 11 PM",
    latitude: 40.112574854810504,
    longitude: -88.22832044594453,
  },
  {
    id: "meche-building",
    name: "MechE Building",
    building: "Sidney Lu Mechanical Engineering Building",
    isFree: true,
    hours: "Mon–Thu 6 AM – 9 PM; Fri 6 AM – 6 PM; closed Sat–Sun",
    latitude: 40.11096529580632,
    longitude: -88.22480139011947,
  },
  {
    id: "everitt-lab",
    name: "Everitt Lab",
    building: "Everitt Laboratory",
    isFree: true,
    hours: "Mon–Thu 7 AM – 9 PM; Fri 7 AM – 7 PM; closed Sat–Sun",
    latitude: 40.11110528462119,
    longitude: -88.22829931895457,
  },
  {
    id: "cafe-bene",
    name: "Cafe Bene",
    building: "S Gregory St, Urbana",
    isFree: false,
    hours: "Mon–Fri 7:30 AM – 9 PM; Sat–Sun 8 AM – 8 PM",
    latitude: 40.10667375235512,
    longitude: -88.22121833909253,
  },
  {
    id: "isr",
    name: "ISR",
    building: "Illinois Street Residence Halls",
    isFree: true,
    // When TerraByte or InfiniTEA is open. ID card access means residents only.
    hours: "Residents only; Mon–Fri 7 AM – 12 AM; Sat 9 AM – 10:30 PM; Sun 9 AM – 12 AM",
    latitude: 40.11031047565066,
    longitude: -88.22186013244959,
  },
  {
    id: "funk",
    name: "Funk",
    building: "ACES Library, Information and Alumni Center",
    isFree: true,
    hours: "Mon–Thu 8:30 AM – 2 AM; Fri 8:30 AM – 6 PM; Sat 10 AM – 8 PM; Sun 12 PM – 2 AM",
    latitude: 40.102983798819885,
    longitude: -88.22512153244993,
  },
];
