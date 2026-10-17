import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../../app';
import { DEMO_ASSETS_DIR } from '../demo.service';

const app = createApp();
const keyText = fs.readFileSync(path.join(DEMO_ASSETS_DIR, 'KEY_contract_flags.md'), 'utf8');

describe('GET /api/demo/contract', () => {
  it('serves the lease PDF inline', async () => {
    const res = await request(app).get('/api/demo/contract').responseType('blob');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toBe('inline; filename="demo-lease.pdf"');
    expect(Buffer.from(res.body).subarray(0, 4).toString()).toBe('%PDF');
  });

  it.each([
    '/api/demo/KEY_contract_flags.md',
    '/api/demo/contract/KEY_contract_flags.md',
    '/api/demo/contract/..%2FKEY_contract_flags.md',
    '/api/demo/contract?file=KEY_contract_flags.md',
    '/api/demo/..%2Fdemo-assets%2FKEY_contract_flags.md',
    '/api/demo/%2e%2e/demo-assets/KEY_contract_flags.md',
  ])('never reveals the answer key via %s', async (url) => {
    const res = await request(app).get(url).responseType('blob');
    expect(Buffer.from(res.body).toString()).not.toContain(keyText.slice(0, 40));
    expect(res.headers['content-type']).not.toContain('markdown');
  });

  it('rejects path traversal', async () => {
    const res = await request(app).get('/api/demo/contract/../../.env');
    expect(res.status).toBe(404);
  });
});
