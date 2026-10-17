import type { GuidanceProgress, ReportSnapshot } from '@movemate/contracts';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, createMove, uploadPhoto } from '../../inspection/__tests__/helpers';
import { buildSummary } from '../report.summary';

const reportFinding = (resolution: 'ok' | 'issue' | 'custom') => ({ findingId: crypto.randomUUID(), aiStatus: null, resolution, text: 't', note: null });
const snapshot: ReportSnapshot = {
  move: { address: 'Aurakatu 12', moveDate: '2026-01-15' },
  generatedAt: '2026-03-01T10:00:00.000Z',
  issues: [],
  findingsByRoom: [
    { room: 'kitchen', findings: [reportFinding('ok'), reportFinding('issue')] },
    { room: 'bathroom', findings: [reportFinding('custom'), reportFinding('ok')] },
  ],
  watchList: [{ title: 'a', detail: 'b', dueDate: '2026-02-14' }],
  disclaimer: 'd',
};

const item = (key: string, status: GuidanceProgress['status']): GuidanceProgress => ({ key, category: 'c', title: key, status });
const checklist = [item('a', 'done'), item('b', 'pending'), item('c', 'na'), item('d', 'no')];

describe('buildSummary', () => {
  it('counts rooms and findings by resolution and takes the due date from the watch list', () => {
    expect(buildSummary('r1', snapshot, checklist)).toEqual({
      reportId: 'r1',
      address: 'Aurakatu 12',
      moveDate: '2026-01-15',
      generatedAt: '2026-03-01T10:00:00.000Z',
      roomsDocumented: 2,
      counts: { ok: 2, issues: 1, custom: 1 },
      watchListDueDate: '2026-02-14',
      checklist: { open: [item('b', 'pending'), item('d', 'no')], handled: [item('a', 'done'), item('c', 'na')] },
    });
  });

  it('has a null due date for an empty watch list', () => {
    expect(buildSummary('r1', { ...snapshot, watchList: [] }, []).watchListDueDate).toBeNull();
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
    expect(res.body.data).toMatchObject({ reportId: report.id, address: 'Aurakatu 12', counts: { ok: 0, issues: 0, custom: 0 } });
    expect(res.body.data.checklist.open.length).toBeGreaterThan(0);
    expect(res.body.data.checklist.handled).toEqual([]);
  });
});
