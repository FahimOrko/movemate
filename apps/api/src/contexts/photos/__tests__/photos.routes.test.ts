import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import sharp from 'sharp';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../../app';
import { env } from '../../../env';
import * as moveService from '../../move/move.service';

const app = createApp();
const unknownId = '00000000-0000-4000-8000-000000000000';

afterEach(() => vi.restoreAllMocks());

async function createMove(advanceTo: 'prepare' | 'before_photos' | 'move_in' = 'before_photos'): Promise<string> {
  const id: string = (await request(app).post('/api/moves').send({ address: 'Aurakatu 12' })).body.data.id;
  const steps = { prepare: 0, before_photos: 1, move_in: 2 }[advanceTo];
  for (let i = 0; i < steps; i++) await request(app).post(`/api/moves/${id}/advance`);
  return id;
}

function png(width = 40, height = 20) {
  return sharp({ create: { width, height, channels: 3, background: '#888' } }).png().toBuffer();
}

function post(moveId: string, file: Buffer, filename = 'a.png', fields = { stage: 'before', room: 'kitchen' }) {
  return request(app)
    .post(`/api/moves/${moveId}/photos`)
    .field('stage', fields.stage)
    .field('room', fields.room)
    .attach('file', file, filename);
}

describe('photo upload', () => {
  it('stores a normalized JPEG: upright, max 1600px, no EXIF', async () => {
    const id = await createMove();
    // 3000x1000 stored sideways: EXIF orientation 6 means "rotate 90 degrees to view".
    const source = await sharp({ create: { width: 3000, height: 1000, channels: 3, background: '#888' } })
      .withExif({ IFD0: { Copyright: 'secret' } })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();

    const res = await post(id, source, 'photo.jpg');

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ moveId: id, stage: 'before', room: 'kitchen', width: 533, height: 1600 });
    const file = await request(app).get(res.body.data.url);
    expect(file.status).toBe(200);
    expect(file.headers['content-type']).toBe('image/jpeg');
    const meta = await sharp(file.body).metadata();
    expect(meta).toMatchObject({ format: 'jpeg', width: 533, height: 1600 });
    expect(meta.exif).toBeUndefined();
  });

  it('rejects a non-image, a fake extension, and an unsupported image type', async () => {
    const id = await createMove();
    const gif = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#fff' } }).gif().toBuffer();

    expect((await post(id, Buffer.from('hello'), 'notes.txt')).status).toBe(400);
    expect((await post(id, Buffer.from('not really a jpeg'), 'photo.jpg')).status).toBe(400);
    expect((await post(id, gif, 'anim.gif')).status).toBe(400);
    expect((await request(app).get(`/api/moves/${id}/photos`)).body.data).toEqual([]);
  });

  it('rejects a missing file and an invalid room or stage', async () => {
    const id = await createMove();

    expect((await request(app).post(`/api/moves/${id}/photos`).field('stage', 'before').field('room', 'kitchen')).status).toBe(400);
    expect((await post(id, await png(), 'a.png', { stage: 'before', room: 'garage' })).status).toBe(400);
    expect((await post(id, await png(), 'a.png', { stage: 'after', room: 'kitchen' })).status).toBe(400);
  });

  it('returns 413 for a file over MAX_UPLOAD_MB', async () => {
    const id = await createMove();
    const tooBig = Buffer.alloc(env.MAX_UPLOAD_MB * 1024 * 1024 + 1);

    const res = await post(id, tooBig);

    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('payload_too_large');
  });

  it('rejects a 5th photo in a room but accepts one in another room', async () => {
    const id = await createMove();
    for (let i = 0; i < 4; i++) expect((await post(id, await png())).status).toBe(201);

    const fifth = await post(id, await png());

    expect(fifth.status).toBe(400);
    expect(fifth.body.error.message).toMatch(/at most 4/);
    expect((await post(id, await png(), 'a.png', { stage: 'before', room: 'bedroom' })).status).toBe(201);
    expect((await request(app).get(`/api/moves/${id}/photos`)).body.data).toHaveLength(5);
  });

  it('allows 8 move-in photos per room and rejects the 9th', async () => {
    const id = await createMove('move_in');
    for (let i = 0; i < 8; i++) expect((await post(id, await png(), 'a.png', { stage: 'move_in', room: 'kitchen' })).status).toBe(201);

    const ninth = await post(id, await png(), 'a.png', { stage: 'move_in', room: 'kitchen' });

    expect(ninth.status).toBe(400);
    expect(ninth.body.error.message).toMatch(/at most 8/);
  });

  it('returns 404 for an unknown move and 409 before the stage is unlocked', async () => {
    expect((await post(unknownId, await png())).status).toBe(404);
    const early = await createMove('prepare');
    expect((await post(early, await png())).status).toBe(409);
    const beforeOnly = await createMove('before_photos');
    expect((await post(beforeOnly, await png(), 'a.png', { stage: 'move_in', room: 'kitchen' })).status).toBe(409);
  });
});

describe('list, relabel, delete, file', () => {
  it('lists by stage', async () => {
    const id = await createMove('move_in');
    await post(id, await png());
    await post(id, await png(), 'a.png', { stage: 'move_in', room: 'kitchen' });

    const before = await request(app).get(`/api/moves/${id}/photos?stage=before`);
    const all = await request(app).get(`/api/moves/${id}/photos`);

    expect(before.body.data).toHaveLength(1);
    expect(all.body.data).toHaveLength(2);
    expect((await request(app).get(`/api/moves/${id}/photos?stage=nope`)).status).toBe(400);
    expect((await request(app).get(`/api/moves/${unknownId}/photos`)).status).toBe(404);
  });

  it('relabels a photo, refuses a full target room, and 404s for an unknown photo', async () => {
    const id = await createMove();
    const photo = (await post(id, await png())).body.data;

    const res = await request(app).patch(`/api/photos/${photo.id}`).send({ room: 'bedroom' });
    expect(res.status).toBe(200);
    expect(res.body.data.room).toBe('bedroom');

    for (let i = 0; i < 4; i++) await post(id, await png(), 'a.png', { stage: 'before', room: 'hallway' });
    expect((await request(app).patch(`/api/photos/${photo.id}`).send({ room: 'hallway' })).status).toBe(400);
    expect((await request(app).patch(`/api/photos/${photo.id}`).send({ room: 'garage' })).status).toBe(400);
    expect((await request(app).patch(`/api/photos/${unknownId}`).send({ room: 'bedroom' })).status).toBe(404);
  });

  it('delete removes the row and the file', async () => {
    const id = await createMove();
    const photo = (await post(id, await png())).body.data;
    const dir = path.join(env.UPLOAD_DIR, id);
    expect(fs.readdirSync(dir)).toHaveLength(1);

    expect((await request(app).delete(`/api/photos/${photo.id}`)).status).toBe(204);

    expect(fs.readdirSync(dir)).toHaveLength(0);
    expect((await request(app).get(photo.url)).status).toBe(404);
    expect((await request(app).delete(`/api/photos/${photo.id}`)).status).toBe(404);
  });

  it('delete still removes the row when the file cleanup fails', async () => {
    const id = await createMove();
    const photo = (await post(id, await png())).body.data;
    vi.spyOn(fs.promises, 'rm').mockRejectedValueOnce(new Error('EACCES'));
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect((await request(app).delete(`/api/photos/${photo.id}`)).status).toBe(204);

    expect(logged).toHaveBeenCalled();
    expect((await request(app).get(`/api/moves/${id}/photos`)).body.data).toEqual([]);
  });

  it('delete returns 409 once the report phase is reached', async () => {
    const id = await createMove();
    const photo = (await post(id, await png())).body.data;
    vi.spyOn(moveService, 'getById').mockResolvedValue({ id, phase: 'report' } as Awaited<ReturnType<typeof moveService.getById>>);

    expect((await request(app).delete(`/api/photos/${photo.id}`)).status).toBe(409);
  });

  it('file route 404s for an unknown or malformed id', async () => {
    expect((await request(app).get(`/api/photos/${unknownId}/file`)).status).toBe(404);
    expect((await request(app).get('/api/photos/not-a-uuid/file')).status).toBe(400);
  });
});
