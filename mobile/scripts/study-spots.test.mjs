import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filterStudySpots } from '../src/features/study-spots/utils/filterStudySpots.ts';
import { mockStudySpots } from '../src/shared/data/mockStudySpots.ts';

test('All preserves every shared spot and its original order', () => {
  assert.deepEqual(filterStudySpots(mockStudySpots, '', 'all'), mockStudySpots);
});
test('Free and Paid partition the existing data without changing it', () => {
  const before = JSON.stringify(mockStudySpots);
  const free = filterStudySpots(mockStudySpots, '', 'free');
  const paid = filterStudySpots(mockStudySpots, '', 'paid');
  assert.ok(free.length > 0 && paid.length > 0);
  assert.ok(free.every(s => s.isFree));
  assert.ok(paid.every(s => !s.isFree));
  assert.equal(free.length + paid.length, mockStudySpots.length);
  assert.equal(JSON.stringify(mockStudySpots), before);
});
test('Search matches spot names, building names, mixed case and whitespace', () => {
  assert.equal(filterStudySpots(mockStudySpots, '  QUIET   reading ', 'all')[0].id, 'main-library');
  assert.equal(filterStudySpots(mockStudySpots, 'grainger', 'all')[0].id, 'grainger');
  assert.equal(filterStudySpots(mockStudySpots, 'library quiet', 'all')[0].id, 'main-library');
  assert.equal(filterStudySpots(mockStudySpots, 'cafe', 'all')[0].id, 'campus-cafe');
  assert.equal(filterStudySpots(mockStudySpots, 'ACES', 'all')[0].id, 'spot-8');
});
test('Search and cost combine, including no-match and reset cases', () => {
  assert.equal(filterStudySpots(mockStudySpots, 'cafe', 'paid').length, 1);
  assert.deepEqual(filterStudySpots(mockStudySpots, 'cafe', 'free'), []);
  assert.deepEqual(filterStudySpots(mockStudySpots, 'not-a-real-place', 'all'), []);
  assert.deepEqual(filterStudySpots([], '', 'all'), []);
  assert.equal(filterStudySpots(mockStudySpots, '   ', 'all').length, mockStudySpots.length);
});
