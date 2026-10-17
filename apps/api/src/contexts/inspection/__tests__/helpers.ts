import request from 'supertest';
import sharp from 'sharp';
import type { Room } from '@movemate/contracts';
import { createApp } from '../../../app';

export const app = createApp();

export async function createMove(advances = 1): Promise<string> {
  const id: string = (await request(app).post('/api/moves').send({ address: 'Aurakatu 12' })).body.data.id;
  for (let i = 0; i < advances; i++) await request(app).post(`/api/moves/${id}/advance`);
  return id;
}

export async function uploadBefore(moveId: string, room: Room): Promise<void> {
  const file = await sharp({ create: { width: 40, height: 20, channels: 3, background: '#888' } }).png().toBuffer();
  await request(app)
    .post(`/api/moves/${moveId}/photos`)
    .field('stage', 'before')
    .field('room', room)
    .attach('file', file, 'a.png')
    .expect(201);
}
