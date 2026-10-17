import fs from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '../../shared/errors';

export const DEMO_ASSETS_DIR = path.resolve(import.meta.dirname, '../../../demo-assets');
export const LEASE_FILENAME = 'demo-lease.pdf';

// Only this one fixed filename is ever served, so the answer key beside it stays private.
export async function getLeaseFile() {
  try {
    await fs.access(path.join(DEMO_ASSETS_DIR, LEASE_FILENAME));
  } catch {
    throw new AppError('not_found', 'Demo lease not found');
  }
  return { root: DEMO_ASSETS_DIR, filename: LEASE_FILENAME };
}
