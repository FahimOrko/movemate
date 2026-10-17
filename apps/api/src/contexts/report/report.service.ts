import type { Report, ReportSummary } from '@movemate/contracts';
import { AppError } from '../../shared/errors';
import * as inspectionService from '../inspection/inspection.service';
import * as moveService from '../move/move.service';
import * as photosService from '../photos/photos.service';
import { buildSnapshot } from './report.snapshot';
import { buildSummary } from './report.summary';
import * as repository from './report.repository';

function toReport(row: repository.ReportRow): Report {
  return { id: row.id, moveId: row.moveId, createdAt: row.createdAt.toISOString(), snapshot: row.snapshot };
}

export async function generate(moveId: string): Promise<Report> {
  await moveService.assertPhaseReached(moveId, 'move_in');
  const [move, findings, moveInPhotos] = await Promise.all([
    moveService.getById(moveId),
    inspectionService.listFindings(moveId),
    photosService.listByStage(moveId, 'move_in'),
  ]);
  if (moveInPhotos.length === 0) throw new AppError('invalid_phase_transition', 'Add move-in photos first');
  if (findings.some((finding) => finding.resolution === 'pending')) {
    throw new AppError('invalid_phase_transition', 'Answer every finding before generating the report');
  }
  const row = await repository.insertReport(moveId, buildSnapshot(move, findings, new Date()));
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
  return buildSummary(report.id, report.snapshot);
}
