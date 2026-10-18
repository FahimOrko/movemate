import { reportSnapshotSchema, type Report, type ReportSummary } from '@movemate/contracts';
import { AppError } from '../../shared/errors';
import * as guidanceService from '../guidance/guidance.service';
import * as inspectionService from '../inspection/inspection.service';
import * as moveService from '../move/move.service';
import * as photosService from '../photos/photos.service';
import { buildSnapshot } from './report.snapshot';
import { buildSummary } from './report.summary';
import * as repository from './report.repository';

// Reports saved by an older snapshot version are not migrated; the user regenerates them.
function toReport(row: repository.ReportRow): Report {
  const snapshot = reportSnapshotSchema.safeParse(row.snapshot);
  if (!snapshot.success) throw new AppError('report_outdated', 'Regenerate this report');
  return { id: row.id, moveId: row.moveId, createdAt: row.createdAt.toISOString(), snapshot: snapshot.data };
}

export async function generate(moveId: string): Promise<Report> {
  await moveService.assertPhaseReached(moveId, 'move_in');
  const [move, findings, checks, photos] = await Promise.all([
    moveService.getById(moveId),
    inspectionService.listFindings(moveId),
    inspectionService.listChecks(moveId),
    photosService.listByStage(moveId),
  ]);
  if (!photos.some((photo) => photo.stage === 'move_in')) throw new AppError('invalid_phase_transition', 'Add move-in photos first');
  if (findings.some((finding) => finding.resolution === 'pending')) {
    throw new AppError('invalid_phase_transition', 'Answer every finding before generating the report');
  }
  const row = await repository.insertReport(moveId, buildSnapshot(move, photos, checks, findings, new Date()));
  await moveService.applyEvent(moveId, 'ReportGenerated');
  return toReport(row);
}

export async function getById(id: string): Promise<Report> {
  const row = await repository.findReportById(id);
  if (!row) throw new AppError('not_found', 'Report not found');
  return toReport(row);
}

export async function getLatest(moveId: string): Promise<Report> {
  await moveService.getById(moveId);
  const row = await repository.findLatestReport(moveId);
  if (!row) throw new AppError('not_found', 'No report yet');
  return toReport(row);
}

export async function getSummary(moveId: string): Promise<ReportSummary> {
  const report = await getLatest(moveId);
  return buildSummary(report.id, report.snapshot, await guidanceService.listProgress(moveId));
}
