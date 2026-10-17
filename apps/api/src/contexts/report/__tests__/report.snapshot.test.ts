import type { Finding, Move } from '@movemate/contracts';
import { describe, expect, it } from 'vitest';
import { buildSnapshot } from '../report.snapshot';
import { REPORT_DISCLAIMER, watchListTemplates } from '../report.templates';

const move: Move = { id: 'm', address: 'Aurakatu 12', moveDate: '2026-01-15', phase: 'move_in', createdAt: '', updatedAt: '' };
const generatedAt = new Date('2026-03-01T10:00:00Z');

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

describe('buildSnapshot', () => {
  it('puts only issue and custom findings in issues, and every finding in findingsByRoom', () => {
    const snapshot = buildSnapshot(
      move,
      [finding({ resolution: 'ok' }), finding({ resolution: 'issue' }), finding({ resolution: 'custom', userNote: 'Loose tile' }), finding({ room: 'hallway', resolution: 'ok' })],
      generatedAt,
    );
    expect(snapshot.issues.map((issue) => issue.kind)).toEqual(['issue', 'custom']);
    expect(snapshot.findingsByRoom.map((group) => [group.room, group.findings.length])).toEqual([['kitchen', 3], ['hallway', 1]]);
  });

  it('adds unclear findings and custom notes to the watch list after which come the 5 templates, due 30 days after the move date', () => {
    const snapshot = buildSnapshot(move, [finding({ aiStatus: 'unclear', resolution: 'ok' }), finding({ resolution: 'custom', userNote: 'Loose tile' })], generatedAt);
    expect(snapshot.watchList).toHaveLength(2 + watchListTemplates.length);
    expect(snapshot.watchList.every((item) => item.dueDate === '2026-02-14')).toBe(true);
    expect(snapshot.watchList[1]?.detail).toBe('Loose tile');
  });

  it('falls back to the generated date, crosses a month end, and always carries the disclaimer', () => {
    const snapshot = buildSnapshot({ ...move, moveDate: null }, [], new Date('2026-01-20T23:30:00Z'));
    expect(snapshot.watchList.map((item) => item.dueDate)).toEqual(Array(5).fill('2026-02-19'));
    expect(snapshot.issues).toEqual([]);
    expect(snapshot.disclaimer).toBe(REPORT_DISCLAIMER);
  });
});
