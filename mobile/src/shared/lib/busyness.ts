import { CheckIn } from '../types';

export const peopleHere = (spotId: string, checkIns: CheckIn[]) =>
  checkIns.filter(c => c.spotId === spotId && !c.endedAt).length;

export const busynessLevel = (n: number) =>
  n >= 6 ? 'packed' : n >= 3 ? 'medium' : 'quiet';