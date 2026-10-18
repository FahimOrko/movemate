import { checkCounts, checkStatusLine, photoCountLine, reportTotals, type Finding, type Move, type Photo, type RoomCheck } from '@movemate/contracts';
import { describe, expect, it } from 'vitest';
import { buildSnapshot } from '../report.snapshot';
import { REPORT_DISCLAIMER, watchListTemplates } from '../report.templates';

const move: Move = { id: 'm', address: 'Aurakatu 12', moveDate: '2026-01-15', phase: 'move_in', createdAt: '', updatedAt: '' };
const generatedAt = new Date('2026-03-01T10:00:00Z');

const photo = (stage: Photo['stage'], room: Photo['room'] = 'kitchen'): Photo => ({
  id: crypto.randomUUID(),
  moveId: 'm',
  stage,
  room,
  width: 40,
  height: 20,
  createdAt: '2026-02-01T09:00:00.000Z',
  url: '/api/photos/x/file',
});

const check = (overrides: Partial<RoomCheck>): RoomCheck => ({
  id: crypto.randomUUID(),
  moveId: 'm',
  room: 'kitchen',
  text: 'Look at the oven door',
  source: 'ai',
  status: 'ok',
  problem: null,
  createdAt: '',
  ...overrides,
});

function finding(overrides: Partial<Finding>): Finding {
  return {
    id: crypto.randomUUID(),
    moveId: 'm',
    room: 'kitchen',
    roomCheckId: null,
    checkText: null,
    source: 'ai',
    aiStatus: 'changed',
    aiSummary: 'A mark on the counter.',
    confidence: 'high',
    resolution: 'ok',
    userNote: null,
    beforePhotos: [],
    moveInPhotos: [],
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

const build = (photos: Photo[] = [], checks: RoomCheck[] = [], findings: Finding[] = [], at = generatedAt, m = move) => buildSnapshot(m, photos, checks, findings, at);

describe('buildSnapshot rooms', () => {
  it('lists every before and move-in photo per room, in the fixed room order', () => {
    const photos = [photo('move_in', 'hallway'), photo('before', 'kitchen'), photo('before', 'kitchen'), photo('move_in', 'kitchen'), photo('before', 'bathroom')];
    const snapshot = build(photos);
    expect(snapshot.version).toBe(2);
    expect(snapshot.rooms.map((room) => room.room)).toEqual(['kitchen', 'bathroom', 'hallway']);
    expect(snapshot.rooms[0]?.beforePhotos).toHaveLength(2);
    expect(snapshot.rooms[0]?.moveInPhotos).toHaveLength(1);
    expect(photoCountLine(snapshot.rooms[0] ?? { beforePhotos: [], moveInPhotos: [] })).toBe('2 before photos, 1 move-in photo');
  });

  it('keeps a room without before photos and leaves it empty of before photos', () => {
    const room = build([photo('move_in', 'balcony')]).rooms[0];
    expect(room?.beforePhotos).toEqual([]);
    expect(room?.moveInPhotos).toHaveLength(1);
  });

  it('lists every check with its answer, including Not checked', () => {
    const room = build([], [check({ status: 'ok' }), check({ status: 'pending' }), check({ status: 'na' })]).rooms[0];
    expect(room?.checks.map((item) => item.status)).toEqual(['ok', 'pending', 'na']);
  });
});

describe('buildSnapshot problems', () => {
  it('includes problems from room checks, AI findings and the user, each with its source', () => {
    const checkId = crypto.randomUUID();
    const problems = build(
      [],
      [],
      [
        finding({ source: 'user', roomCheckId: checkId, checkText: 'Look at the oven door', aiStatus: null, aiSummary: null, resolution: 'issue', userNote: 'Cracked glass' }),
        finding({ resolution: 'issue', userNote: 'Yes, scratched' }),
        finding({ resolution: 'custom', userNote: 'Actually a stain' }),
        finding({ source: 'user', aiStatus: null, aiSummary: null, resolution: 'issue', userNote: 'Loose tile' }),
      ],
    ).rooms[0]?.problems;
    expect(problems?.map((problem) => [problem.source, problem.resolution])).toEqual([
      ['room_check', 'issue'],
      ['ai', 'issue'],
      ['ai', 'custom'],
      ['user', 'issue'],
    ]);
    expect(problems?.[0]).toMatchObject({ checkText: 'Look at the oven door', note: 'Cracked glass', aiSummary: null });
    expect(problems?.[1]).toMatchObject({ aiSummary: 'A mark on the counter.', note: 'Yes, scratched' });
  });

  it('never lists OK, looks-good or pending findings as problems', () => {
    const snapshot = build([], [], [finding({ resolution: 'ok' }), finding({ aiStatus: 'looks_good', resolution: 'ok' }), finding({ resolution: 'pending' })]);
    expect(snapshot.rooms.flatMap((room) => room.problems)).toEqual([]);
    expect(reportTotals(snapshot).problems).toBe(0);
  });

  it('carries the photos linked to a problem', () => {
    const before = photo('before');
    const moveIn = photo('move_in');
    const [problem] = build([before, moveIn], [], [finding({ resolution: 'issue', beforePhotos: [before], moveInPhotos: [moveIn] })]).rooms[0]?.problems ?? [];
    expect(problem?.beforePhotos).toEqual([before]);
    expect(problem?.moveInPhotos).toEqual([moveIn]);
  });
});

describe('status line and totals', () => {
  it('writes the status line from the counts', () => {
    const statuses = ['ok', 'ok', 'ok', 'problem', 'na', 'pending', 'pending'] as const;
    expect(checkStatusLine(checkCounts(statuses.map((status) => ({ status }))))).toBe('5 of 7 checked, 1 problem, 1 N/A');
    expect(checkStatusLine(checkCounts([{ status: 'ok' }, { status: 'pending' }]))).toBe('1 of 2 checked');
    expect(checkStatusLine(checkCounts([{ status: 'problem' }, { status: 'problem' }]))).toBe('2 of 2 checked, 2 problems');
    expect(checkStatusLine(checkCounts([]))).toBe('No room checks');
  });

  it('totals rooms with photos, photos, checks answered and problems', () => {
    const snapshot = build(
      [photo('before'), photo('move_in'), photo('move_in')],
      [check({ status: 'ok' }), check({ status: 'pending' }), check({ room: 'bedroom', status: 'na' })],
      [finding({ resolution: 'issue' })],
    );
    expect(reportTotals(snapshot)).toEqual({ roomsDocumented: 1, beforePhotos: 1, moveInPhotos: 2, checksAnswered: 2, checksTotal: 3, problems: 1 });
  });
});

describe('buildSnapshot watch list', () => {
  it('adds unclear findings and custom notes before the 5 templates, due 30 days after the move date', () => {
    const snapshot = build([], [], [finding({ aiStatus: 'unclear', resolution: 'ok' }), finding({ resolution: 'custom', userNote: 'Loose tile' })]);
    expect(snapshot.watchList).toHaveLength(2 + watchListTemplates.length);
    expect(snapshot.watchList.every((item) => item.dueDate === '2026-02-14')).toBe(true);
    expect(snapshot.watchList[1]?.detail).toBe('Loose tile');
  });

  it('builds a valid empty report: generated date fallback, month end, disclaimer', () => {
    const snapshot = build([], [], [], new Date('2026-01-20T23:30:00Z'), { ...move, moveDate: null });
    expect(snapshot.watchList.map((item) => item.dueDate)).toEqual(Array(5).fill('2026-02-19'));
    expect(snapshot.rooms).toEqual([]);
    expect(snapshot.disclaimer).toBe(REPORT_DISCLAIMER);
  });
});
