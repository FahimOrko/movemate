import type { GuidanceProgress, ReportSnapshot } from '@movemate/contracts';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, createMove, uploadPhoto } from '../../inspection/__tests__/helpers';
import { buildSummary } from '../report.summary';

const photo = (stage: 'before' | 'move_in') => ({
  id: crypto.randomUUID(),
  moveId: crypto.randomUUID(),
  stage,
  room: 'kitchen' as const,
  width: 1,
  height: 1,
  createdAt: '2026-02-01T09:00:00.000Z',
  url: '/api/photos/x/file',
});
const problem = (source: 'room_check' | 'ai' | 'user', note: string | null) => ({
  findingId: crypto.randomUUID(),
  source,
  checkText: null,
  aiSummary: source === 'ai' ? 'AI saw a mark' : null,
  resolution: 'issue' as const,
  note,
  beforePhotos: [photo('before')],
  moveInPhotos: [photo('move_in'), photo('move_in')],
});
const roomCheck = (text: string, status: 'ok' | 'problem' | 'na' | 'pending') => ({ checkId: crypto.randomUUID(), text, source: 'ai' as const, status });

const snapshot: ReportSnapshot = {
  version: 2,
  move: { address: 'Aurakatu 12', moveDate: '2026-01-15' },
  generatedAt: '2026-03-01T10:00:00.000Z',
  rooms: [
    {
      room: 'kitchen',
      beforePhotos: [photo('before')],
      moveInPhotos: [photo('move_in'), photo('move_in')],
      checks: [roomCheck('Look at the oven', 'ok'), roomCheck('Look at the sink', 'pending'), roomCheck('Look at the fridge', 'problem')],
      problems: [problem('room_check', 'Cracked'), problem('ai', null)],
    },
    { room: 'balcony', beforePhotos: [], moveInPhotos: [], checks: [], problems: [problem('user', 'Rust')] },
  ],
  watchList: [{ title: 'a', detail: 'b', dueDate: '2026-02-14' }],
  disclaimer: 'd',
};

const item = (key: string, status: GuidanceProgress['status']): GuidanceProgress => ({ key, category: 'c', title: key, status, locked: false, providerName: null });
const checklist = [item('a', 'done'), item('b', 'pending'), item('c', 'na'), item('d', 'no')];

describe('buildSummary', () => {
  it('totals the record, lists problems by room and the checks left open', () => {
    const summary = buildSummary('r1', snapshot, checklist);
    expect(summary).toMatchObject({
      reportId: 'r1',
      address: 'Aurakatu 12',
      generatedAt: '2026-03-01T10:00:00.000Z',
      totals: { roomsDocumented: 1, beforePhotos: 1, moveInPhotos: 2, checksAnswered: 2, checksTotal: 3, problems: 3 },
      watchListDueDate: '2026-02-14',
    });
    expect(summary.problems).toEqual([
      { room: 'kitchen', source: 'room_check', text: 'Cracked', photoCount: 3 },
      { room: 'kitchen', source: 'ai', text: 'AI saw a mark', photoCount: 3 },
      { room: 'balcony', source: 'user', text: 'Rust', photoCount: 3 },
    ]);
    expect(summary.rooms).toEqual([{ room: 'kitchen', counts: { total: 3, checked: 2, problems: 1, na: 0 }, notChecked: ['Look at the sink'] }]);
  });

  it('splits the checklist into open and handled', () => {
    expect(buildSummary('r1', snapshot, checklist).checklist).toEqual({ open: [item('b', 'pending'), item('d', 'no')], handled: [item('a', 'done'), item('c', 'na')] });
  });

  it('has a null due date for an empty watch list and no problems for an empty report', () => {
    const summary = buildSummary('r1', { ...snapshot, rooms: [], watchList: [] }, []);
    expect(summary.watchListDueDate).toBeNull();
    expect(summary.problems).toEqual([]);
    expect(summary.totals.problems).toBe(0);
  });
});

describe('GET /moves/:id/summary', () => {
  it('404s before a report exists, then summarises the latest report', async () => {
    const id = await createMove(2);
    await request(app).get(`/api/moves/${id}/summary`).expect(404);

    await uploadPhoto(id, 'kitchen', 'before');
    await uploadPhoto(id, 'kitchen', 'move_in');
    const report = (await request(app).post(`/api/moves/${id}/reports`).expect(201)).body.data;

    const res = await request(app).get(`/api/moves/${id}/summary`).expect(200);
    expect(res.body.data).toMatchObject({
      reportId: report.id,
      address: 'Aurakatu 12',
      totals: { roomsDocumented: 1, beforePhotos: 1, moveInPhotos: 1, problems: 0 },
      problems: [],
    });
    expect(res.body.data.checklist.open.length).toBeGreaterThan(0);
    expect(res.body.data.checklist.handled).toEqual([]);
  });
});
