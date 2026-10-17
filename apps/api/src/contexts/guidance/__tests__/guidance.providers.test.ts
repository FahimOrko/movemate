import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../../../app';
import { env } from '../../../env';

const app = createApp();
const originalUrl = env.IF_INSURANCE_URL;

afterEach(() => {
  env.IF_INSURANCE_URL = originalUrl;
});

async function getProviders() {
  const res = await request(app).get('/api/guidance/providers');
  expect(res.status).toBe(200);
  return res.body.data as { explainer: { title: string; body: string }; providers: { name: string; highlighted: boolean; url: string | null }[] };
}

describe('GET /api/guidance/providers', () => {
  it('highlights If with the configured url and returns the explainer', async () => {
    env.IF_INSURANCE_URL = 'https://example.com/if';

    const { explainer, providers } = await getProviders();

    expect(explainer.body.length).toBeGreaterThan(0);
    expect(providers.find((p) => p.name === 'If')).toMatchObject({ highlighted: true, url: 'https://example.com/if' });
  });

  it('highlights only If and gives no other provider a url', async () => {
    env.IF_INSURANCE_URL = 'https://example.com/if';

    const { providers } = await getProviders();

    expect(providers.filter((p) => p.highlighted).map((p) => p.name)).toEqual(['If']);
    expect(providers.filter((p) => p.name !== 'If').every((p) => p.url === null)).toBe(true);
  });

  it('returns url null when the env value is not set', async () => {
    env.IF_INSURANCE_URL = undefined;

    const { providers } = await getProviders();

    expect(providers.find((p) => p.name === 'If')).toMatchObject({ highlighted: true, url: null });
  });

  it('has no price-like fields anywhere', async () => {
    const res = await request(app).get('/api/guidance/providers');

    expect(JSON.stringify(res.body)).not.toMatch(/price|cost|fee|eur|€|rate|discount_?percent/i);
  });
});
