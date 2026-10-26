import { CheckIn } from '../types';

// makes timestamps relative to now, so "10 min ago" always looks right
const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

export const mockCheckIns: CheckIn[] = [
  // still here (no endedAt)
  { id: 'c1', userId: 'u1', userName: 'Jordan', spotId: 'spot-1', note: 'CS 225 MP', startedAt: ago(15) },
  { id: 'c2', userId: 'u2', userName: 'Alex',   spotId: 'spot-1', startedAt: ago(40) },
  { id: 'c3', userId: 'u3', userName: 'Priya',  spotId: 'spot-1', note: 'MATH 241', startedAt: ago(5) },
  { id: 'c4', userId: 'u4', userName: 'Sam',    spotId: 'spot-2', startedAt: ago(25) },
  // already left
  { id: 'c5', userId: 'u1', userName: 'Jordan', spotId: 'spot-2', startedAt: ago(1500), endedAt: ago(1410), rating: { busyness: 3, noise: 2 } },
  { id: 'c6', userId: 'u2', userName: 'Alex',   spotId: 'spot-3', startedAt: ago(300),  endedAt: ago(200),  rating: { busyness: 4, noise: 4 } },
  { id: 'c7', userId: 'u1', userName: 'Jordan', spotId: 'spot-1', startedAt: ago(2900), endedAt: ago(2780) },
  { id: 'c8', userId: 'u5', userName: 'Maya',   spotId: 'spot-4', note: 'ECON 102', startedAt: ago(180), endedAt: ago(90), rating: { busyness: 2, noise: 1 } },
];
